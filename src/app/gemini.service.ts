import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  private generativeAI: GoogleGenerativeAI;
  private messageHistory: ChatItem[] = [];
  private messageHistorySubject: BehaviorSubject<ChatItem[]> = new BehaviorSubject<ChatItem[]>([]);
  private context: string[] = [];

  // List of allowed subjects and their related keywords
  private allowedSubjects: { [key: string]: string[] } = {
    // Allow Greetings
    greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'good night'],
    // Allow Goodbyes
    goodbyes: ['goodbye', 'bye', 'see you', 'later', 'farewell'],
    // Allow Gratitude
    gratitude: ['thank', 'thanks', 'appreciate', 'grateful'],
    // Allow Apologies
    apologies: ['sorry', 'apologize', 'regret'],
    // Allow Questions
    questions: ['what', 'when', 'where', 'why', 'who', 'how', '?'],
    // Allow Educational Subjects
    math: ['math', 'algebra', 'geometry', 'calculus', 'trigonometry'],
    science: ['science', 'biology', 'chemistry', 'physics', 'astronomy'],
    history: ['history', 'world war', 'civil war', 'ancient', 'medieval'],
    literature: ['literature', 'poetry', 'novel', 'drama', 'prose'],
    programming: ['programming', 'coding', 'software', 'development', 'computer', 'science'],
    // Allow General Knowledge
    general: ['general', 'knowledge', 'information', 'fact', 'learn', 'know'],
  };

  // List of disallowed keywords/phrases
  private disallowedKeywords: string[] = [
    'joke', 'funny', 'humor', 'abuse', 'bad word', 'curse', 'insult', 'irrelevant', 'nonsense', 'gossip', 'useless'
  ];

  constructor() {
    this.generativeAI = new GoogleGenerativeAI('AIzaSyDrnUNdl2sQO1wT8nPL_rpHik-pVmR9E6Y');
  }

  async generateText(prompt: string) {
    // Add user message to the history
    this.messageHistory.push({ from: 'user', message: prompt });
    this.messageHistorySubject.next([...this.messageHistory]);

    // Check if the prompt is disallowed
    if (this.isDisallowedContent(prompt)) {
      const disallowedMessage = "Sorry, this chat is restricted to educational purposes only. Please avoid jokes, abusive language, or irrelevant content.";
      this.messageHistory.push({ from: 'bot', message: disallowedMessage });
      this.messageHistorySubject.next([...this.messageHistory]);
      return;
    }

    // Check if the prompt is within the allowed subjects
    if (!this.isAllowedSubject(prompt)) {
      const disallowedMessage = "Sorry, this chat is restricted to educational purposes only. Please ask questions related to math, science, history, or literature.";
      this.messageHistory.push({ from: 'bot', message: disallowedMessage });
      this.messageHistorySubject.next([...this.messageHistory]);
      return;
    }

    // Update context with the new prompt
    this.updateContext(prompt);

    // Check if the prompt has been asked before
    const previousResponse = this.getPreviousResponse(prompt);
    if (previousResponse) {
      this.messageHistory.push({ from: 'bot', message: previousResponse });
      this.messageHistorySubject.next([...this.messageHistory]);
      return;
    }

    // Generate new response using GoogleGenerativeAI
    const model = this.generativeAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(this.context.join(' '));
    const response = await result.response;
    const text = await response.text();

    // Add bot response to the history
    this.messageHistory.push({ from: 'bot', message: text });
    this.messageHistorySubject.next([...this.messageHistory]);
  }

  private isAllowedSubject(prompt: string): boolean {
    // Convert prompt to lowercase for case-insensitive comparison
    const lowerCasePrompt = prompt.toLowerCase();

    // Check if any of the allowed subject keywords are present in the prompt
    for (const subject in this.allowedSubjects) {
      if (this.allowedSubjects[subject].some(keyword => lowerCasePrompt.includes(keyword))) {
        return true;
      }
    }
    return false;
  }

  private isDisallowedContent(prompt: string): boolean {
    // Convert prompt to lowercase for case-insensitive comparison
    const lowerCasePrompt = prompt.toLowerCase();

    // Check if any of the disallowed keywords are present in the prompt
    return this.disallowedKeywords.some(keyword => lowerCasePrompt.includes(keyword));
  }

  private getPreviousResponse(prompt: string): string | null {
    for (let i = 0; i < this.messageHistory.length; i++) {
      if (this.messageHistory[i].from === 'user' && this.messageHistory[i].message === prompt) {
        if (this.messageHistory[i + 1] && this.messageHistory[i + 1].from === 'bot') {
          return this.messageHistory[i + 1].message;
        }
      }
    }
    return null;
  }

  private updateContext(prompt: string) {
    // Maintain the last 5 interactions for context
    if (this.context.length >= 10) {
      this.context.splice(0, 2); // Remove the oldest user-bot pair
    }
    this.context.push(prompt);
  }

  public getMessageHistory(): Observable<ChatItem[]> {
    return this.messageHistorySubject.asObservable();
  }
}

// Add the ChatItem interface definition
interface ChatItem {
  from: 'user' | 'bot';
  message: string;
}
