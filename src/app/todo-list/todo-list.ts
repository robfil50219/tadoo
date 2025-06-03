// src/app/todo-list/todo-list.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, TodoItem } from '../services/todo';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-todo-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './todo-list.html',
    styleUrls: ['./todo-list.scss']
})
export class TodoListComponent implements OnInit, OnDestroy {
    todos: TodoItem[] = [];
    newTitle = '';
    editingId: string | null = null;      // <– Nye linje
    private sub?: Subscription;

    constructor(private todoService: TodoService) { }

    ngOnInit(): void {
        this.sub = this.todoService.hentTodos().subscribe(data => {
            this.todos = data;
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    toggleCompleted(todo: TodoItem) {
        this.todoService.oppdater({ ...todo, completed: !todo.completed });
    }

    addTodo() {
        const title = this.newTitle.trim();
        if (!title) return;
        this.todoService.leggTil(title);
        this.newTitle = '';
    }

    deleteTodo(id: string) {
        this.todoService.slett(id);
    }

    // Kalles når vi er ferdig med å redigere (blur eller Enter)
    finishEdit(todo: TodoItem) {
        // Hvis tom tittel etter redigering, sletter vi oppgaven
        const trimmed = todo.title.trim();
        if (!trimmed) {
            this.todoService.slett(todo.id);
        } else {
            this.todoService.oppdater({ ...todo, title: trimmed });
        }
        this.editingId = null;  // gå ut av redigeringsmodus
    }
}

