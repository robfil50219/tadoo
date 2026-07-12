import { useTodoStore } from '@/lib/store/todoStore';

/** Feature-level access to task state and actions. */
export function useTasks() {
  const todos = useTodoStore((store) => store.state.todos);
  const addTodo = useTodoStore((store) => store.addTodo);
  const updateTodo = useTodoStore((store) => store.updateTodo);
  const toggleTodo = useTodoStore((store) => store.toggleTodo);
  const deleteTodo = useTodoStore((store) => store.deleteTodo);
  const approveTodo = useTodoStore((store) => store.approveTodo);

  return { todos, addTodo, updateTodo, toggleTodo, deleteTodo, approveTodo };
}
