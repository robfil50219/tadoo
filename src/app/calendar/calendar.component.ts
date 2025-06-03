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

    showModal = false;
    modalText = '';

    constructor(private todoService: TodoService) { }

    ngOnInit(): void {
        this.calendarOptions = {
            plugins: [dayGridPlugin, interactionPlugin],
            locale: noLocale,
            initialView: 'dayGridMonth',

            // La hendelsene overlappe
            // (standarden er true, så vi kan fjerne eller eksplisitt sette det til true)
            eventOverlap: true,

            // La cellene utvide seg i høyden om nødvendig
            dayMaxEventRows: false,
            expandRows: true,

            eventDisplay: 'block',
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            },

            // Legg til title-attributt ved mount, slik at hover viser full tittel
            eventDidMount: (info: any) => {
                info.el.setAttribute('title', info.event.title);
            },

            events: [],

            // Klikk på hendelse åpner modal
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
        this.modalText = clickInfo.event.title;
        this.showModal = true;
    }
}
