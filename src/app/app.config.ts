import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"nggemini","appId":"1:461080149877:web:6ca242e32db8de9714dd3c","storageBucket":"nggemini.appspot.com","apiKey":"AIzaSyDOY47eSxUiBuk09X4Y2uT6EcahUto3GSs","authDomain":"nggemini.firebaseapp.com","messagingSenderId":"461080149877"})), provideAuth(() => getAuth())]
};
