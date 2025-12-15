import { FileText, TestTube, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadCardProps {
  type: 'prescription' | 'test-result';
  fileName: string;
  uploadedAt: string;
  onRemove?: () => void;
}

const UploadCard = ({ type, fileName, uploadedAt, onRemove }: UploadCardProps) => {
  const isPrescription = type === 'prescription';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        isPrescription
          ? 'border-primary/20 bg-primary/5'
          : 'border-success/20 bg-success/5'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          isPrescription ? 'bg-primary/10' : 'bg-success/10'
        )}
      >
        {isPrescription ? (
          <FileText className="h-5 w-5 text-primary" />
        ) : (
          <TestTube className="h-5 w-5 text-success" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
          <CheckCircle className="h-4 w-4 shrink-0 text-success" />
        </div>
        <p className="text-xs text-muted-foreground">
          {isPrescription ? 'وصفة طبية' : 'نتيجة فحص'} • تم الرفع{' '}
          {new Date(uploadedAt).toLocaleDateString('ar-SA')}
        </p>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default UploadCard;
