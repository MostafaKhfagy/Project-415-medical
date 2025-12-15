import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const MessageBubble = ({ role, content, timestamp }: MessageBubbleProps) => {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-slide-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-user-bubble' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-user-bubble-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-user-bubble text-user-bubble-foreground rounded-tl-sm'
              : 'bg-assistant-bubble text-assistant-bubble-foreground rounded-tr-sm'
          )}
        >
          {content}
        </div>
        {timestamp && (
          <span className="px-1 text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
