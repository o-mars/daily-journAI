import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h1 className="text-xl font-semibold mb-6 text-white text-center">Confirm Deletion</h1>
        <p className="mb-4 text-white text-center">Are you sure you want to permanently delete this?</p>
        {message && <p className="text-white mb-6 text-center">{message}</p>}
        <div className="flex justify-evenly gap-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-700 text-white"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
