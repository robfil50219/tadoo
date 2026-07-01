'use client';

import { useTodoStore } from '@/lib/store/todoStore';
import { useLanguage } from '@/lib/hooks/useLanguage';
import './Calendar.scss';

export default function Calendar() {
  const { state } = useTodoStore();
  const { locale } = useLanguage();

  const datedTasks = [...state.todos]
    .filter((task) => task.dueDateTime)
    .sort((a, b) => new Date(a.dueDateTime || '').getTime() - new Date(b.dueDateTime || '').getTime());
  const unscheduledTasks = state.todos.filter((task) => !task.dueDateTime);

  const formatDateTime = (value?: string) => {
    if (!value) return 'No due date';
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  };

  const memberName = (id: string) => state.members.find((member) => member.id === id)?.name || 'Unassigned';

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2>Calendar</h2>
        <p className="subtitle">Upcoming task schedule</p>
      </div>

      <section className="calendar-section">
        <h3>Scheduled</h3>
        {datedTasks.length === 0 ? (
          <p className="empty-state">No scheduled tasks.</p>
        ) : (
          <div className="calendar-list">
            {datedTasks.map((task) => (
              <article className={`calendar-item ${task.completed ? 'completed' : ''}`} key={task.id}>
                <time>{formatDateTime(task.dueDateTime)}</time>
                <div>
                  <h4>{task.title}</h4>
                  <p>{memberName(task.assigneeId)}</p>
                </div>
                <span>{task.priority}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="calendar-section">
        <h3>Unscheduled</h3>
        {unscheduledTasks.length === 0 ? (
          <p className="empty-state">No unscheduled tasks.</p>
        ) : (
          <div className="calendar-list">
            {unscheduledTasks.map((task) => (
              <article className={`calendar-item ${task.completed ? 'completed' : ''}`} key={task.id}>
                <time>No date</time>
                <div>
                  <h4>{task.title}</h4>
                  <p>{memberName(task.assigneeId)}</p>
                </div>
                <span>{task.priority}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
