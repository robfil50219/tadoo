'use client';

import { useMemo, useState } from 'react';
import { TodoItem, useTodoStore } from '@/lib/store/todoStore';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { memberColorClassName } from '@/lib/memberColors';
import './Calendar.scss';

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const dateKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const isSameMonth = (date: Date, month: Date) =>
  date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();

const isValidDate = (date: Date) => !Number.isNaN(date.getTime());

export default function Calendar() {
  const { state } = useTodoStore();
  const { locale, t } = useLanguage();
  const [displayMonth, setDisplayMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const datedTasks = useMemo(
    () =>
      [...state.todos]
        .filter((task) => task.dueDateTime && isValidDate(new Date(task.dueDateTime)))
        .sort(
          (a, b) =>
            new Date(a.dueDateTime || '').getTime() - new Date(b.dueDateTime || '').getTime()
        ),
    [state.todos]
  );

  const unscheduledTasks = useMemo(
    () => state.todos.filter((task) => !task.dueDateTime),
    [state.todos]
  );

  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, TodoItem[]>();

    datedTasks.forEach((task) => {
      const key = dateKey(new Date(task.dueDateTime || ''));
      grouped.set(key, [...(grouped.get(key) || []), task]);
    });

    return grouped;
  }, [datedTasks]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(displayMonth);
    const mondayFirstOffset = (monthStart.getDay() + 6) % 7;
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - mondayFirstOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return day;
    });
  }, [displayMonth]);

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2026, 0, 5 + index))
      ),
    [locale]
  );

  const selectedKey = dateKey(selectedDate);
  const todayKey = dateKey(new Date());
  const selectedTasks = tasksByDate.get(selectedKey) || [];
  const monthTaskCount = datedTasks.filter((task) =>
    isSameMonth(new Date(task.dueDateTime || ''), displayMonth)
  ).length;

  const memberById = (id: string) => state.members.find((member) => member.id === id);

  const memberName = (id: string) => memberById(id)?.name || t('common.unassigned');

  const memberColorClass = (id: string) => memberColorClassName(memberById(id)?.color);

  const formatMonth = (date: Date) =>
    new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);

  const formatSelectedDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);

  const formatTime = (value?: string) => {
    if (!value) return t('calendar.noTime');
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  };

  const formatTaskStamp = (task: TodoItem, showDate: boolean) => {
    if (!task.dueDateTime) return showDate ? t('calendar.noDate') : t('calendar.noTime');
    if (!showDate) return formatTime(task.dueDateTime);

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(task.dueDateTime));
  };

  const moveMonth = (offset: number) => {
    const nextMonth = startOfMonth(
      new Date(displayMonth.getFullYear(), displayMonth.getMonth() + offset, 1)
    );
    setDisplayMonth(nextMonth);
    setSelectedDate((current) => {
      const nextDay = Math.min(current.getDate(), daysInMonth(nextMonth));
      return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextDay);
    });
  };

  const selectDay = (date: Date) => {
    setSelectedDate(date);
    if (!isSameMonth(date, displayMonth)) {
      setDisplayMonth(startOfMonth(date));
    }
  };

  const selectToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setDisplayMonth(startOfMonth(today));
  };

  const dayClassName = (day: Date, taskCount: number) =>
    [
      'calendar-day',
      !isSameMonth(day, displayMonth) ? 'outside-month' : '',
      dateKey(day) === todayKey ? 'today' : '',
      dateKey(day) === selectedKey ? 'selected' : '',
      taskCount > 0 ? 'has-tasks' : '',
    ]
      .filter(Boolean)
      .join(' ');

  const renderTask = (task: TodoItem, showDate = false) => (
    <article className={`agenda-item ${task.completed ? 'completed' : ''}`} key={task.id}>
      <time className="agenda-time" dateTime={task.dueDateTime}>
        {formatTaskStamp(task, showDate)}
      </time>
      <div className="agenda-body">
        <h4>{task.title}</h4>
        <div className="agenda-meta">
          <span
            className={`member-dot ${memberColorClass(task.assigneeId)}`}
            aria-hidden="true"
          />
          <span>{memberName(task.assigneeId)}</span>
          <span>{t(`tasks.category.${task.category}`)}</span>
        </div>
      </div>
      <span className={`priority-badge priority-${task.priority}`}>
        {t(`tasks.priority.${task.priority}`)}
      </span>
    </article>
  );

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div>
          <h2>{t('calendar.title')}</h2>
          <p className="subtitle">{t('calendar.subtitle')}</p>
        </div>
        <div className="calendar-actions" aria-label={t('calendar.navigation')}>
          <button type="button" onClick={() => moveMonth(-1)}>
            {t('common.previous')}
          </button>
          <button type="button" onClick={selectToday}>
            {t('common.today')}
          </button>
          <button type="button" onClick={() => moveMonth(1)}>
            {t('common.next')}
          </button>
        </div>
      </div>

      <div className="calendar-board">
        <section className="calendar-month" aria-label={`${formatMonth(displayMonth)} calendar`}>
          <div className="month-header">
            <div>
              <h3>{formatMonth(displayMonth)}</h3>
              <p>{t('calendar.monthTaskCount', { count: monthTaskCount })}</p>
            </div>
          </div>

          <div className="weekday-row" aria-hidden="true">
            {weekdayLabels.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="month-grid">
            {calendarDays.map((day) => {
              const key = dateKey(day);
              const tasks = tasksByDate.get(key) || [];

              return (
                <button
                  type="button"
                  key={key}
                  className={dayClassName(day, tasks.length)}
                  onClick={() => selectDay(day)}
                  aria-label={`${key === selectedKey ? `${t('calendar.selected')}, ` : ''}${formatSelectedDate(
                    day
                  )}, ${t('calendar.dayTaskCount', { count: tasks.length })}`}
                >
                  <span className="day-number">{day.getDate()}</span>
                  {tasks.length > 0 && (
                    <>
                      <span className="day-task-preview" aria-hidden="true">
                        {tasks.slice(0, 3).map((task) => (
                          <span
                            key={task.id}
                            className={`task-dot priority-${task.priority}`}
                          />
                        ))}
                        <span className="day-task-count">{tasks.length}</span>
                      </span>
                      <span className="day-task-titles">
                        {tasks.slice(0, 2).map((task) => (
                          <span key={task.id}>{task.title}</span>
                        ))}
                        {tasks.length > 2 && (
                          <span>{t('calendar.moreTasks', { count: tasks.length - 2 })}</span>
                        )}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="calendar-agenda">
          <section className="agenda-panel">
            <div className="agenda-header">
              <time dateTime={selectedKey}>{formatSelectedDate(selectedDate)}</time>
              <p>
                {selectedTasks.length === 1
                  ? t('calendar.oneScheduledTask')
                  : t('calendar.scheduledTasks', { count: selectedTasks.length })}
              </p>
            </div>

            {selectedTasks.length === 0 ? (
              <p className="empty-state">{t('calendar.noScheduledTasks')}</p>
            ) : (
              <div className="agenda-list">{selectedTasks.map((task) => renderTask(task))}</div>
            )}
          </section>

          <section className="agenda-panel">
            <div className="agenda-header">
              <h3>{t('calendar.unscheduled')}</h3>
              <p>
                {unscheduledTasks.length === 1
                  ? t('calendar.oneTaskWithoutDate')
                  : t('calendar.tasksWithoutDate', { count: unscheduledTasks.length })}
              </p>
            </div>

            {unscheduledTasks.length === 0 ? (
              <p className="empty-state">{t('calendar.everyTaskHasDate')}</p>
            ) : (
              <div className="agenda-list compact">
                {unscheduledTasks.slice(0, 5).map((task) => renderTask(task, true))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
