import React, { useState, useEffect } from 'react';

interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  placeholder: string;
  onSubmit: (value: string) => void;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export function InputDialog({
  isOpen,
  onClose,
  title,
  placeholder,
  onSubmit,
  submitButtonText = "OK",
  cancelButtonText = "Cancel"
}: InputDialogProps) {
  const [inputValue, setInputValue] = useState('');

  // Reset input value when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && inputValue.trim()) {
        onSubmit(inputValue.trim());
        onClose();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, inputValue, onSubmit, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 md:mx-auto flex flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold text-[#0e141b]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0e141b] focus:outline-0 focus:ring-0 border border-[#d0dbe7] focus:border-[#1980e6] h-14 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            autoFocus
          />
        </div>

        <div className="p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-[#1980e6] text-white rounded-md hover:bg-[#1670cc] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitButtonText}
          </button>
        </div>
      </div>
    </div>
  );
} 