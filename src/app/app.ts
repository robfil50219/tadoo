// src/app/app.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TodoListComponent } from './todo-list/todo-list';
import { CalendarComponent } from './calendar/calendar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TodoListComponent,
    CalendarComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  // Som standard viser vi 'home' (kalender + liste)
  showSection: 'home' | 'about' = 'home';
}
