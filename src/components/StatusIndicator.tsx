import React, { useState, useEffect, useRef, useImperativeHandle, useCallback } from "react";

export type StatusType = "loading" | "success" | "error" | "info";

export type StatusMessage = {
  type: StatusType;
  text: string;
  duration?: number;
};

export interface StatusIndicatorHandle {
  pushMessage: (message: StatusMessage) => void;
  clearMessages: () => void;
}

const MIN_DURATION = 500;
const DEFAULT_DURATION = 1500;

interface Props {
  onStatusClear?: () => void;
  className?: string;
}

const StatusIndicator = React.forwardRef<StatusIndicatorHandle, Props>(function StatusIndicator({ onStatusClear, className = "" }, ref) {
  const [currentMessage, setCurrentMessage] = useState<StatusMessage | null>(null);
  const messageQueueRef = useRef<StatusMessage[]>([]);
  const processingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const processNextMessage = useCallback(() => {
    if (processingRef.current || messageQueueRef.current.length === 0) {
      processingRef.current = false;
      setCurrentMessage(null);
      return;
    }

    processingRef.current = true;
    const nextMessage = messageQueueRef.current[0];
    const isLoadingOrInfo = nextMessage.type === "loading" || nextMessage.type === "info";

    setCurrentMessage(nextMessage);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const duration = nextMessage.duration || (isLoadingOrInfo ? MIN_DURATION : DEFAULT_DURATION);

    timerRef.current = setTimeout(() => {
      if (isLoadingOrInfo) {
        if (messageQueueRef.current.length > 1) {
          messageQueueRef.current.shift();
          onStatusClear?.();
          processingRef.current = false;
          processNextMessage();
        } else {
          processingRef.current = false;
        }
      } else {
        messageQueueRef.current.shift();
        onStatusClear?.();
        processingRef.current = false;
        processNextMessage();
      }
    }, duration);
  }, [onStatusClear]);

  const pushMessage = useCallback((message: StatusMessage) => {
    messageQueueRef.current.push(message);
    if (!processingRef.current) {
      processNextMessage();
    }
  }, [processNextMessage]);

  const clearMessages = useCallback(() => {
    messageQueueRef.current = [];
    setCurrentMessage(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    processingRef.current = false;
  }, []);

  useImperativeHandle(ref, () => ({
    pushMessage,
    clearMessages,
  }));

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!currentMessage?.text) return null;
  return (
    <div
      className={`flex flex-rowstatus-indicator w-full rounded-md bg-transparent ${
        currentMessage.type === "loading"
          ? "text-gray-500"
          : currentMessage.type === "success"
          ? "text-green-500"
          : currentMessage.type === "error"
          ? "text-red-500"
          : "text-yellow-400"
      } transition-opacity duration-300 ${
        currentMessage ? "opacity-100" : "opacity-0"
      } ${className} text-sm`} // Added text-sm for smaller font size
    >
      {currentMessage.type === "loading" && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {currentMessage.text}
    </div>
  );
});

export default StatusIndicator;
