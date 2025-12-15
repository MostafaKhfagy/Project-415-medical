import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Typing dots */}
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-assistant-bubble px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '200ms' }} />
        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
};

export default TypingIndicator;
