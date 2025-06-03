// src/app/app.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';        // <–– Bruk CommonModule
import { TodoListComponent } from './todo-list/todo-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,            // for *ngIf, *ngFor osv. (brukes indirekte av TodoList)
    TodoListComponent        // importér TodoListComponent, som selv importerer det den trenger
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App { }
