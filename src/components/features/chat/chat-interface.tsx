'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your Student AI Assistant. I can help you with:\n\n• Analyzing study materials\n• Answering questions about assignments\n• Explaining complex concepts\n• Organizing your study schedule\n• Searching through your files\n\nWhat would you like help with today?',
    timestamp: new Date(),
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Call Chat API
    try {
      const chatHistory = messages.slice(1).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          history: chatHistory,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.error
          ? `Sorry, I encountered an error: ${data.error}. Please try again.`
          : data.data?.response || 'No response received',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered a network error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full flex-col bg-[var(--background)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                'group animate-fade-in',
                message.role === 'assistant'
                  ? 'bg-[var(--card-bg)]'
                  : 'bg-transparent'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mx-auto flex max-w-3xl gap-4 px-4 py-6">
                {/* Avatar */}
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                    message.role === 'assistant'
                      ? 'bg-[var(--accent)]'
                      : 'bg-[var(--input-bg)]'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  ) : (
                    <User size={16} className="text-[var(--text-secondary)]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {message.role === 'assistant' ? 'Student AI' : 'You'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="prose prose-invert max-w-none text-[var(--text-primary)]">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('•') ? 'ml-4' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="bg-[var(--card-bg)]">
              <div className="mx-auto flex max-w-3xl gap-4 px-4 py-6">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
                  <span className="text-sm text-[var(--text-secondary)]">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--card-border)] bg-[var(--background)] p-4">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your studies..."
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]',
                'px-4 py-3 pr-12 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]',
                'max-h-[200px] min-h-[52px]'
              )}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                'absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-lg',
                'transition-all duration-200',
                input.trim() && !isLoading
                  ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                  : 'bg-[var(--input-border)] text-[var(--text-muted)]'
              )}
            >
              <Send size={16} />
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
            AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
