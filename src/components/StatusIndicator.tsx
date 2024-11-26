import { useEffect } from 'react';

export type StatusType = 'loading' | 'success' | 'error' | null;

interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  duration?: number; // Duration in ms for success/error messages
  onStatusClear?: () => void;
  className?: string;
}

export default function StatusIndicator({
  status,
  message,
  duration = 2000,
  onStatusClear,
  className = ''
}: StatusIndicatorProps) {
  useEffect(() => {
    if ((status === 'success' || status === 'error') && onStatusClear) {
      const timer = setTimeout(() => {
        onStatusClear();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [status, duration, onStatusClear]);

  if (!status) return null;

  const baseClasses = 'flex items-center px-4 py-2 rounded';
  const statusClasses = {
    loading: 'bg-gray-700',
    success: 'bg-green-800',
    error: 'bg-red-800'
  };

  return (
    <div className={`${baseClasses} ${statusClasses[status]} ${className}`}>
      {status === 'loading' ? (
        <>
          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          <span>{message || 'Loading...'}</span>
        </>
      ) : (
        <span>{message}</span>
      )}
    </div>
  );
} 