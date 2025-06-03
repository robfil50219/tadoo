// src/app/todo-list/todo-list.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';     // for *ngFor, *ngIf
import { FormsModule } from '@angular/forms';       // for [(ngModel)]
import { TodoService, TodoItem } from '../services/todo';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-todo-list',
    standalone: true,
    imports: [
        CommonModule,    // for ngFor, ngIf, etc.
        FormsModule      // for ngModel
    ],
    templateUrl: './todo-list.html',
    styleUrls: ['./todo-list.scss']
})
export class TodoListComponent implements OnInit, OnDestroy {
    todos: TodoItem[] = [];
    newTitle = '';
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
}
