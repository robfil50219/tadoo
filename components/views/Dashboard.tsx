'use client';

import { useTodoStore } from '@/lib/store/todoStore';
import { useLanguage } from '@/lib/hooks/useLanguage';
import './Dashboard.scss';

export default function Dashboard() {
  const { state } = useTodoStore();
  const { t, locale } = useLanguage();

  const todayTasks = state.todos.filter((todo) => {
    if (!todo.dueDateTime) return false;
    const today = new Date().toDateString();
    return new Date(todo.dueDateTime).toDateString() === today;
  });

  const openTasks = state.todos.filter((todo) => !todo.completed);
  const childTasks = state.todos.filter((todo) => {
    const child = state.members.find((m) => m.id === todo.assigneeId);
    return child?.role === 'child' && !todo.completed;
  });

  const formatDateTime = (value?: string) => {
    if (!value) return '';
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  };

  const getMemberBadgeClass = (color: string) => {
    const sanitizedColor = color.replace(/[^a-z0-9_-]/gi, '').toLowerCase();
    return `member-badge member-badge--${sanitizedColor}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome to {state.familyName}</h2>
        <p className="subtitle">{"Here's what's happening with your family"}</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>{"Today's Tasks"}</h3>
          <p className="card-number">{todayTasks.length}</p>
          <div className="card-list">
            {todayTasks.length === 0 ? (
              <p className="empty">No tasks for today</p>
            ) : (
              <ul>
                {todayTasks.slice(0, 3).map((task) => (
                  <li key={task.id}>
                    <span className="task-title">{task.title}</span>
                    <span className="task-time">{formatDateTime(task.dueDateTime)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Open Tasks</h3>
          <p className="card-number">{openTasks.length}</p>
          <div className="card-list">
            {openTasks.length === 0 ? (
              <p className="empty">{"All tasks completed!"}</p>
            ) : (
              <ul>
                {openTasks.slice(0, 3).map((task) => (
                  <li key={task.id}>
                    <span className="task-title">{task.title}</span>
                    <span className={`task-priority priority-${task.priority}`}>{task.priority}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Family Members</h3>
          <p className="card-number">{state.members.length}</p>
          <div className="members-list">
            {state.members.map((member) => (
              <div
                key={member.id}
                className={getMemberBadgeClass(member.color)}
                title={member.name}
              >
                {member.avatar}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
