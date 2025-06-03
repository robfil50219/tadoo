// src/app/services/todo.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TodoItem {
    id: string;
    title: string;
    completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
    private readonly STORAGE_KEY = 'tadoo-todos';
    private todosSubject = new BehaviorSubject<TodoItem[]>(this.loadFromStorage());
    public todos$: Observable<TodoItem[]> = this.todosSubject.asObservable();

    private loadFromStorage(): TodoItem[] {
        const json = localStorage.getItem(this.STORAGE_KEY);
        return json ? JSON.parse(json) : [];
    }

    private saveToStorage(todos: TodoItem[]) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    }

    hentTodos(): Observable<TodoItem[]> {
        return this.todos$;
    }

    leggTil(title: string) {
        const todos = this.todosSubject.value;
        const newTodo: TodoItem = {
            id: crypto.randomUUID(),
            title,
            completed: false
        };
        const oppdatert = [...todos, newTodo];
        this.todosSubject.next(oppdatert);
        this.saveToStorage(oppdatert);
    }

    oppdater(updated: TodoItem) {
        const todos = this.todosSubject.value.map(t =>
            t.id === updated.id ? updated : t
        );
        this.todosSubject.next(todos);
        this.saveToStorage(todos);
    }

    slett(id: string) {
        const todos = this.todosSubject.value.filter(t => t.id !== id);
        this.todosSubject.next(todos);
        this.saveToStorage(todos);
    }
}