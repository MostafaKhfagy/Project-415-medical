import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Chat } from '@/api/client';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

const ChatSidebar = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    return date.toLocaleDateString('ar-SA');
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-l border-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border p-3">
        {!collapsed && <span className="font-medium text-sidebar-foreground">المحادثات</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          variant="outline"
          className={cn(
            'w-full justify-start border-dashed border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed && 'justify-center px-0'
          )}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span className="mr-2">محادثة جديدة</span>}
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                'group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                currentChatId === chat.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{chat.title || 'محادثة جديدة'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(chat.updated_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          ))}

          {chats.length === 0 && !collapsed && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              لا توجد محادثات بعد. ابدأ محادثة جديدة!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
