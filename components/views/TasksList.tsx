'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TaskCategory, TaskPriority, TodoItem, useTodoStore } from '@/lib/store/todoStore';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { memberColorClassName } from '@/lib/memberColors';
import {
  fadeInUpVariants,
  menuVariants,
  subtleButtonHover,
  subtleButtonTap,
  subtleCardHover,
  taskItemVariants,
} from '@/lib/animations';
import './TasksList.scss';

export default function TasksList() {
  const shouldReduceMotion = useReducedMotion() ?? false;
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
    <motion.div
      className="tasks-list"
      variants={fadeInUpVariants(shouldReduceMotion)}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="tasks-header" layout>
        <h2>Tasks</h2>
        <p className="subtitle">{"Manage your family's to-do list"}</p>
      </motion.div>

      <motion.div
        className="add-task-form"
        layout
        whileHover={subtleCardHover(shouldReduceMotion)}
      >
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
              aria-label="Task assignee"
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
              aria-label="Task due date and time"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="category-select"
              aria-label="Task category"
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
              aria-label="Task priority"
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
            <motion.button
              type="submit"
              className="add-button"
              whileTap={subtleButtonTap(shouldReduceMotion)}
              whileHover={subtleButtonHover(shouldReduceMotion)}
            >
              {t('add-task')}
            </motion.button>
          </div>
        </form>
      </motion.div>

      <div className="tasks-container">
        <AnimatePresence mode="popLayout" initial={false}>
          {state.todos.length === 0 ? (
            <motion.div
              key="empty-tasks"
              className="empty-state"
              variants={fadeInUpVariants(shouldReduceMotion)}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <p>No tasks yet - add the first family mission!</p>
            </motion.div>
          ) : (
            <motion.div key="task-groups" className="task-groups" layout>
              {state.members.map((member) => {
                const memberTasks = state.todos.filter((t) => t.assigneeId === member.id);
                if (memberTasks.length === 0) return null;

                return (
                  <motion.div
                    key={member.id}
                    className={`task-group ${memberColorClassName(member.color)}`}
                    layout
                    variants={fadeInUpVariants(shouldReduceMotion)}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div
                      className="group-header"
                    >
                      <div
                        className="member-avatar"
                      >
                        {member.avatar}
                      </div>
                      <h3>{member.name}</h3>
                      <span className="task-count">{memberTasks.length}</span>
                    </div>

                    <div className="task-items">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {memberTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            variants={taskItemVariants(shouldReduceMotion)}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            whileHover={subtleCardHover(shouldReduceMotion)}
                            className={`task-item ${task.completed ? 'completed' : ''}`}
                          >
                            <motion.input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTodo(task)}
                              className="task-checkbox"
                              aria-label={`Mark ${task.title} as ${task.completed ? 'not completed' : 'completed'}`}
                              whileTap={subtleButtonTap(shouldReduceMotion)}
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
                                  aria-label="Edit task title"
                                  autoFocus
                                />
                              ) : (
                                <motion.button
                                  type="button"
                                  className="task-title"
                                  onClick={() => beginEdit(task)}
                                  title={t('edit-task')}
                                  whileTap={subtleButtonTap(shouldReduceMotion)}
                                >
                                  {task.title}
                                </motion.button>
                              )}
                              <div className="task-meta">
                                <span>{formatDue(task.dueDateTime)}</span>
                                <span className={`priority priority-${task.priority}`}>{task.priority}</span>
                                <span>{task.category}</span>
                                {task.completed && <span className="complete-label">Done</span>}
                                {task.requiresApproval && (
                                  <span>{task.approvedById ? 'Approved' : 'Needs approval'}</span>
                                )}
                              </div>
                            </div>
                            <div className="task-menu">
                              <motion.button
                                type="button"
                                className="task-menu-button"
                                aria-label="Open task menu"
                                {...(openMenuId === task.id ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
                                onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                                whileTap={subtleButtonTap(shouldReduceMotion)}
                              >
                                i
                              </motion.button>
                              <AnimatePresence>
                                {openMenuId === task.id && (
                                  <motion.div
                                    className="task-menu-panel"
                                    role="menu"
                                    variants={menuVariants(shouldReduceMotion)}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                  >
                                    <motion.button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => beginEdit(task)}
                                      whileTap={subtleButtonTap(shouldReduceMotion)}
                                    >
                                      Edit
                                    </motion.button>
                                    {task.requiresApproval && task.completed && !task.approvedById && adultMember && (
                                      <motion.button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                          approveTodo(task.id, adultMember.id);
                                          setOpenMenuId(null);
                                        }}
                                        whileTap={subtleButtonTap(shouldReduceMotion)}
                                      >
                                        Approve
                                      </motion.button>
                                    )}
                                    <motion.button
                                      type="button"
                                      role="menuitem"
                                      className="danger-menu-item"
                                      onClick={() => {
                                        deleteTodo(task.id);
                                        setOpenMenuId(null);
                                      }}
                                      whileTap={subtleButtonTap(shouldReduceMotion)}
                                    >
                                      Delete
                                    </motion.button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
