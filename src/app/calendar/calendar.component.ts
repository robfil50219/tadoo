import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TodoService, TodoItem } from '../services/todo';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [
        CommonModule,
        FullCalendarModule
    ],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
    calendarOptions: any;
    private sub?: Subscription;

    constructor(private todoService: TodoService) { }

    ngOnInit(): void {
        this.calendarOptions = {
            plugins: [dayGridPlugin, interactionPlugin],
            initialView: 'dayGridMonth',
            events: [],
            eventClick: this.handleEventClick.bind(this)
        };

        this.sub = this.todoService.hentTodos().subscribe((todos: TodoItem[]) => {
            this.calendarOptions.events = todos
                .filter(t => !!t.dueDateTime)
                .map(t => ({
                    id: t.id,
                    title: t.title,
                    start: t.dueDateTime,
                    allDay: false
                }));
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    handleEventClick(clickInfo: any) {
        const eventId = clickInfo.event.id;
        alert('Clicked event ID: ' + eventId);
    }
}
