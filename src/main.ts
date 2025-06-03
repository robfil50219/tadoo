// src/main.ts

import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';

if ((import.meta as any).env?.PROD) {
  enableProdMode();
}

bootstrapApplication(App)
  .catch(err => console.error(err));