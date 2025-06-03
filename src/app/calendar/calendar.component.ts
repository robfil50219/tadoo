// src/app/calendar/calendar.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import noLocale from '@fullcalendar/core/locales/nb';
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
            locale: noLocale,
            initialView: 'dayGridMonth',

            // Slå av maks‐antall-hendelser per dag slik at cellen vokser
            dayMaxEvents: false,       // ingen “+n more”
            dayMaxEventRows: false,    // tillat ubegrenset rader

            eventDisplay: 'block',
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            },
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
