'use client';

import { useState } from 'react';
import { useTodoStore } from '@/lib/store/todoStore';
import { useLanguage } from '@/lib/hooks/useLanguage';
import './TasksList.scss';

export default function TasksList() {
  const { state, addTodo, toggleTodo, deleteTodo } = useTodoStore();
  const { t } = useLanguage();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(state.members[0]?.id || '');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTodo(newTaskTitle, selectedAssignee);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="tasks-list">
      <div className="tasks-header">
        <h2>Tasks</h2>
        <p className="subtitle">Manage your family's to-do list</p>
      </div>

      <div className="add-task-form">
        <form onSubmit={handleAddTask}>
          <div className="form-group">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={t('new-task')}
              className="task-input"
            />
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="assignee-select"
            >
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <button type="submit" className="add-button">
              {t('add-task')}
            </button>
          </div>
        </form>
      </div>

      <div className="tasks-container">
        {state.todos.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="task-groups">
            {state.members.map((member) => {
              const memberTasks = state.todos.filter((t) => t.assigneeId === member.id);
              if (memberTasks.length === 0) return null;

              return (
                <div key={member.id} className="task-group">
                  <div
                    className="group-header"
                    style={{ borderLeftColor: member.color }}
                  >
                    <div
                      className="member-avatar"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.avatar}
                    </div>
                    <h3>{member.name}</h3>
                    <span className="task-count">{memberTasks.length}</span>
                  </div>

                  <div className="task-items">
                    {memberTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`task-item ${task.completed ? 'completed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTodo(task)}
                          className="task-checkbox"
                        />
                        <span className="task-title">{task.title}</span>
                        <button
                          onClick={() => deleteTodo(task.id)}
                          className="delete-button"
                          title={t('delete-task')}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
