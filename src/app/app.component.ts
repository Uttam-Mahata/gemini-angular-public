import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { GeminiService } from './gemini.service';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import {SidebarModule} from "primeng/sidebar";
import {DialogModule} from "primeng/dialog";
import{CardModule} from "primeng/card";
import {ScrollPanelModule} from "primeng/scrollpanel";

interface ChatItem {
  from: 'user' | 'bot';
  message: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SkeletonComponent, FormsModule, CommonModule, InputTextModule, ButtonModule, SkeletonModule, SidebarModule, DialogModule, CardModule, ScrollPanelModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isCardVisible: boolean = false;
  visibleSidebar: boolean = false;
  visibleDialog: boolean = false;
  title = 'gemini-inte';
  prompt: string = '';
  geminiService: GeminiService = inject(GeminiService);
  loading: boolean = false;
  chatHistory: ChatItem[] = [];
  displayDialog: boolean = false;
  showIntroduction: boolean = true;

  ngOnInit() {
    this.geminiService.getMessageHistory().subscribe((res) => {
      if (res) {
        this.chatHistory = res;
      }
    });
  }
  toggleCard() {
    this.isCardVisible = !this.isCardVisible;
  }

  async sendData() {
    if (this.prompt && !this.loading) {
      this.showIntroduction = false;
      this.loading = true;
      const data = this.prompt;
      this.prompt = '';
      await this.geminiService.generateText(data);
      this.loading = false;
    }
  }

  // formatText(text: string) {
  //   return text.replace(/\*/g, '');
  // }
  formatText(text: string): string {
    // Replace bold, italic, underline, strikethrough, and code snippets
    text = text.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); // Double asterisks for bold
    text = text.replace(/__([^_]+)__/g, '<i>$1</i>'); // Double underscores for italic
    text = text.replace(/~~([^~]+)~~/g, '<u>$1</u>'); // Double tildes for underline
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>'); // Backticks for inline code
    text = text.replace(/~~([^~]+)~~/g, '<s>$1</s>'); // Double tildes for strikethrough
  
    // Handle headings (Markdown style: #, ##, ###, etc.)
    text = text.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    text = text.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // handle mathemathical equations
    text = text.replace(/\$([^\$]+)\$/g, '<span class="latex">$1</span>');

    // convert latex to html
    text = this.convertLatexToHtml(text);




  
    // Handle lists (unordered)
    text = text.replace(/^\*\s+(.*)$/gim, '<ul><li>$1</li></ul>');
    text = text.replace(/<\/ul>\s*<ul>/g, ''); // Remove extra <ul> tags
  
    // Handle ordered lists
    text = text.replace(/^\d+\.\s+(.*)$/gim, '<ol><li>$1</li></ol>');
    text = text.replace(/<\/ol>\s*<ol>/g, ''); // Remove extra <ol> tags
  
    // Handle blockquotes (Markdown style: >)
    text = text.replace(/^>\s+(.*)$/gim, '<blockquote>$1</blockquote>');
  
    // Handle links (Markdown style: [text](url))
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    // Handle latex (Markdown style: $)
    text = text.replace(/\$([^\$]+)\$/g, '<span class="latex">$1</span>');
  
    // Replace line breaks with <br> tags
    text = text.replace(/\n/g, '<br>');
  
    // Wrap the final content in a <p> tag
    text = `<p>${text}</p>`;
  
    return text;
  }

  convertLatexToHtml(text: string): string {
    // Replace inline math equations
    text = text.replace(/\$\$(.*?)\$\$/g, '<span class="latex">$$1</span>');
  
    // Replace block math equations
    text = text.replace(/```math(.*?)```/gs, '<span class="latex">$$1</span>');
  
    return text;
  }
  

  openDialog() {
    this.visibleDialog = true;
  }
  showDialog() {
    this.displayDialog = true;
  }
}
