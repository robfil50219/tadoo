'use client';

import { useEffect, useState } from 'react';
import { useTodoStore } from '@/lib/store/todoStore';
import { useLanguage } from '@/lib/hooks/useLanguage';
import './Chat.scss';

export default function Chat() {
  const { state, addMessage } = useTodoStore();
  const { locale, t } = useLanguage();
  const [senderId, setSenderId] = useState(state.members[0]?.id || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!senderId && state.members[0]) {
      setSenderId(state.members[0].id);
    }
  }, [senderId, state.members]);

  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    addMessage(senderId, message);
    setMessage('');
  };

  const memberName = (id: string) => state.members.find((member) => member.id === id)?.name || t('common.unknown');
  const formatTime = (value: string) => new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

  return (
    <div className="chat-view">
      <div className="chat-header">
        <h2>{t('chat.title')}</h2>
        <p className="subtitle">{t('chat.subtitle')}</p>
      </div>

      <div className="message-list">
        {state.messages.length === 0 ? (
          <p className="empty-state">{t('chat.noMessages')}</p>
        ) : (
          state.messages.map((item) => (
            <article className="message-item" key={item.id}>
              <div>
                <strong>{memberName(item.senderId)}</strong>
                <span>{formatTime(item.sentAt)}</span>
              </div>
              <p>{item.text}</p>
            </article>
          ))
        )}
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <select
          value={senderId}
          onChange={(event) => setSenderId(event.target.value)}
          aria-label={t('chat.sender')}
          title={t('chat.sender')}
        >
          {state.members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t('chat.messagePlaceholder')}
          required
        />
        <button type="submit">{t('chat.send')}</button>
      </form>
    </div>
  );
}
