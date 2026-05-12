import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    FamilyMember,
    FamilyState,
    TaskCategory,
    TaskPriority,
    TodoItem,
    TodoService
} from '../services/todo';
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
    state?: FamilyState;
    todos: TodoItem[] = [];
    members: FamilyMember[] = [];
    newTitle = '';
    newDueDateTime = '';
    newAssigneeId = '';
    newCategory: TaskCategory = 'home';
    newPriority: TaskPriority = 'normal';
    newRequiresApproval = false;
    newReminderMinutesBefore = 30;
    editingId: string | null = null;
    private sub?: Subscription;

    categories: { value: TaskCategory; label: string }[] = [
        { value: 'home', label: 'Hjem' },
        { value: 'school', label: 'Skole' },
        { value: 'activity', label: 'Aktivitet' },
        { value: 'health', label: 'Helse' },
        { value: 'shopping', label: 'Handling' }
    ];

    priorities: { value: TaskPriority; label: string }[] = [
        { value: 'low', label: 'Lav' },
        { value: 'normal', label: 'Normal' },
        { value: 'high', label: 'Haster' }
    ];

    constructor(private todoService: TodoService) { }

    ngOnInit(): void {
        this.sub = this.todoService.hentState().subscribe(state => {
            this.state = state;
            this.todos = [...state.todos].sort((a, b) => {
                if (!a.dueDateTime && !b.dueDateTime) return 0;
                if (!a.dueDateTime) return 1;
                if (!b.dueDateTime) return -1;
                return new Date(a.dueDateTime).getTime() - new Date(b.dueDateTime).getTime();
            });
            this.members = state.members;
            this.newAssigneeId ||= state.members[0]?.id || '';
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    toggleCompleted(todo: TodoItem) {
        this.todoService.toggleFullfort(todo);
    }

    addTodo() {
        const title = this.newTitle.trim();
        if (!title) return;

        const due = this.newDueDateTime
            ? new Date(this.newDueDateTime).toISOString()
            : undefined;

        this.todoService.leggTil(
            title,
            this.newAssigneeId,
            due,
            this.newCategory,
            this.newPriority,
            this.newRequiresApproval,
            this.newReminderMinutesBefore
        );

        this.newTitle = '';
        this.newDueDateTime = '';
        this.newCategory = 'home';
        this.newPriority = 'normal';
        this.newRequiresApproval = false;
        this.newReminderMinutesBefore = 30;
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

    approve(todo: TodoItem) {
        const adult = this.members.find(member => member.role === 'adult');
        if (adult) {
            this.todoService.godkjennOppgave(todo.id, adult.id);
        }
    }

    memberFor(id: string): FamilyMember | undefined {
        return this.members.find(member => member.id === id);
    }

    formatDue(value?: string): string {
        if (!value) return 'Ingen frist';
        return new Intl.DateTimeFormat('nb-NO', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(value));
    }
}
