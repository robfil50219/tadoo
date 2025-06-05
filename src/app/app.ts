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

  // Ny: styrer om To-Do‐dropdown vises
  showTodoDropdown = false;

  // Åpne/lukke “Stor kalender”-modal
  openFullCalendar() {
    this.showFullCalendar = true;
  }
  closeFullCalendar() {
    this.showFullCalendar = false;
  }

  // Toggle-metode for To-Do‐dropdown
  toggleTodoDropdown() {
    this.showTodoDropdown = !this.showTodoDropdown;
  }
}