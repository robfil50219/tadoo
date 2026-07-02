'use client';

import { useEffect, useState } from 'react';
import { TaskCategory, TaskPriority, TodoItem, useTodoStore } from '@/lib/store/todoStore';
import { useLanguage } from '@/lib/hooks/useLanguage';
import './TasksList.scss';

export default function TasksList() {
  const { state, addTodo, updateTodo, toggleTodo, deleteTodo, approveTodo } = useTodoStore();
  const { t } = useLanguage();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(state.members[0]?.id || '');
  const [dueDateTime, setDueDateTime] = useState('');
  const [category, setCategory] = useState<TaskCategory>('home');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAssignee || !state.members.some((member) => member.id === selectedAssignee)) {
      setSelectedAssignee(state.members[0]?.id || '');
    }
  }, [selectedAssignee, state.members]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTodo(
        newTaskTitle.trim(),
        selectedAssignee,
        dueDateTime ? new Date(dueDateTime).toISOString() : undefined,
        category,
        priority,
        requiresApproval
      );
      setNewTaskTitle('');
      setDueDateTime('');
      setCategory('home');
      setPriority('normal');
      setRequiresApproval(false);
    }
  };

  const beginEdit = (task: TodoItem) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
    setOpenMenuId(null);
  };

  const finishEdit = (task: TodoItem) => {
    const title = editingTitle.trim();
    if (!title) {
      deleteTodo(task.id);
    } else {
      updateTodo({ ...task, title });
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const formatDue = (value?: string) => {
    if (!value) return 'No due date';
    return new Intl.DateTimeFormat('nb-NO', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  };

  const adultMember = state.members.find((member) => member.role === 'adult');

  return (
    <div className="tasks-list">
      <div className="tasks-header">
        <h2>Tasks</h2>
        <p className="subtitle">{"Manage your family's to-do list"}</p>
      </div>

      <div className="add-task-form">
        <form onSubmit={handleAddTask}>
          <div className="form-grid">
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
            <input
              type="datetime-local"
              value={dueDateTime}
              onChange={(e) => setDueDateTime(e.target.value)}
              className="due-input"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="category-select"
            >
              <option value="home">Home</option>
              <option value="school">School</option>
              <option value="activity">Activity</option>
              <option value="health">Health</option>
              <option value="shopping">Shopping</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="priority-select"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
            <label className="approval-toggle">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
              />
              Approval
            </label>
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
                        <div className="task-body">
                          {editingId === task.id ? (
                            <input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={() => finishEdit(task)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') finishEdit(task);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="edit-input"
                              autoFocus
                            />
                          ) : (
                            <button
                              type="button"
                              className="task-title"
                              onClick={() => beginEdit(task)}
                              title={t('edit-task')}
                            >
                              {task.title}
                            </button>
                          )}
                          <div className="task-meta">
                            <span>{formatDue(task.dueDateTime)}</span>
                            <span className={`priority priority-${task.priority}`}>{task.priority}</span>
                            <span>{task.category}</span>
                            {task.requiresApproval && (
                              <span>{task.approvedById ? 'Approved' : 'Needs approval'}</span>
                            )}
                          </div>
                        </div>
                        <div className="task-menu">
                          <button
                            type="button"
                            className="task-menu-button"
                            aria-label="Open task menu"
                            aria-expanded={openMenuId === task.id}
                            onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                          >
                            i
                          </button>
                          {openMenuId === task.id && (
                            <div className="task-menu-panel" role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => beginEdit(task)}
                              >
                                Edit
                              </button>
                              {task.requiresApproval && task.completed && !task.approvedById && adultMember && (
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    approveTodo(task.id, adultMember.id);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                type="button"
                                role="menuitem"
                                className="danger-menu-item"
                                onClick={() => {
                                  deleteTodo(task.id);
                                  setOpenMenuId(null);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
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
