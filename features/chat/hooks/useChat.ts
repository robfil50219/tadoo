import { useTodoStore } from '@/lib/store/todoStore';

/** Feature-level access to family chat state and actions. */
export function useChat() {
  const messages = useTodoStore((store) => store.state.messages);
  const addMessage = useTodoStore((store) => store.addMessage);

  return { messages, addMessage };
}
