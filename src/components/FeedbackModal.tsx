import React, { useState } from "react";
import { submitFeedback } from "@/src/client/firebase.service.client";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastJournalEntryId: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, lastJournalEntryId }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  const handleSubmit = async () => {
    try {
      await submitFeedback(lastJournalEntryId, rating, comment);
    } catch (error) {
      console.error(error);
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Feedback</h2>
        <div className="rating">
          {[2, 4, 6, 8, 10].map((star) => (
            <span
              key={star}
              className={star <= rating ? "star selected" : "star"}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          placeholder="Add your comment here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={handleClose}>Cancel</button>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 50px;
          left: 0;
          width: 100%;
          height: calc(100% - 50px - 50px);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal {
          background: #111111;
          padding: 20px;
          border-radius: 10px;
          width: 300px;
          text-align: center;
        }
        .rating {
          margin: 10px 0;
        }
        .star {
          font-size: 24px;
          cursor: pointer;
          padding: 0 8px;
        }
        .star.selected {
          color: gold;
        }
        textarea {
          width: 100%;
          height: 100px;
          margin: 10px 0;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background: #111111;
          color: #eeeeee;
        }
        button {
          margin: 5px;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default FeedbackModal;