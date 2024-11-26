import React, { useState } from "react";
import { submitFeedback } from "@/src/client/firebase.service.client";
import { useRouter } from "next/navigation";
import StatusIndicator, { StatusType } from "@/src/components/StatusIndicator";

interface FeedbackProps {
  lastJournalEntryId: string;
}

const Feedback: React.FC<FeedbackProps> = ({ lastJournalEntryId }) => {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [status, setStatus] = useState<{ type: StatusType; message: string }>({
    type: null,
    message: ''
  });

  
  const handleSubmit = async () => {
    setStatus({ type: 'loading', message: 'Sending feedback...' });
    try {
      await submitFeedback(lastJournalEntryId, rating, comment);
      setStatus({ type: 'success', message: 'Feedback submitted!' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Error submitting feedback' });
    } finally {
      setTimeout(() => {
        router.back();
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center space-x-4 my-4">
          {[2, 4, 6, 8, 10].map((star) => (
            <span
              key={star}
              className={`text-2xl cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-400"}`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          className="w-full h-32 bg-gray-800 text-white p-2 rounded-md mb-4"
          placeholder="Add your comment here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-blue-500 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Submit
          </button>
          <button 
            className="bg-gray-500 px-4 py-2 rounded-md"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
        <div className="mt-4">
          <StatusIndicator
            status={status.type}
            message={status.message}
            duration={1200}
            onStatusClear={() => setStatus({ type: null, message: '' })}
          />
        </div>
      </div>
    </div>
  );
};

export default Feedback; 