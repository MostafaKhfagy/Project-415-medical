import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, FileText, TestTube } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatInputProps {
  onSend: (message: string) => void;
  onUploadPrescription: (file: File) => void;
  onUploadTestResult: (file: File) => void;
  disabled?: boolean;
}

const ChatInput = ({
  onSend,
  onUploadPrescription,
  onUploadTestResult,
  disabled = false,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prescriptionInputRef = useRef<HTMLInputElement>(null);
  const testResultInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPrescription(file);
      e.target.value = '';
    }
  };

  const handleTestResultUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadTestResult(file);
      e.target.value = '';
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        {/* Upload Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0" disabled={disabled}>
              <Paperclip className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => prescriptionInputRef.current?.click()}>
              <FileText className="ml-2 h-4 w-4" />
              رفع وصفة طبية
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => testResultInputRef.current?.click()}>
              <TestTube className="ml-2 h-4 w-4" />
              رفع نتيجة فحص
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hidden file inputs */}
        <input
          ref={prescriptionInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handlePrescriptionUpload}
        />
        <input
          ref={testResultInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleTestResultUpload}
        />

        {/* Message Input */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="صف أعراضك أو اطرح سؤالاً صحياً..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 pl-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        اضغط Enter للإرسال، Shift+Enter لسطر جديد
      </p>
    </div>
  );
};

export default ChatInput;
