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
  showSection: 'home' | 'about' = 'home';

  // Ny: styrer om “Stor kalender”-modal er åpen
  showFullCalendar = false;

  // Toggle-metoder for knappen
  openFullCalendar() {
    this.showFullCalendar = true;
  }
  closeFullCalendar() {
    this.showFullCalendar = false;
  }
}