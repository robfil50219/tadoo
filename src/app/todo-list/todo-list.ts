import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';    // <--- Viktig!
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
    newDueDateTime = '';
    editingId: string | null = null;
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

        // Hvis bruker har valgt dato/tid, bruk den; ellers blir feltet tomt
        const due = this.newDueDateTime ? new Date(this.newDueDateTime).toISOString() : undefined;
        this.todoService.leggTil(title);

        if (due) {
            // Finn siste lagt til oppgave og oppdater med valgt dueDateTime
            const siste = this.todos[this.todos.length - 1];
            if (siste) {
                this.todoService.oppdater({ ...siste, dueDateTime: due });
            }
        }

        this.newTitle = '';
        this.newDueDateTime = '';
    }

    deleteTodo(id: string) {
        this.todoService.slett(id);
    }

    finishEdit(todo: TodoItem) {
        const trimmed = todo.title.trim();
        if (!trimmed) {
            this.todoService.slett(todo.id);
        } else {
            this.todoService.oppdater({ ...todo, title: trimmed });
        }
        this.editingId = null;
    }
}

