interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export function NotificationDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText = "OK"
}: NotificationDialogProps) {

  if (!isOpen) {
    return null;
  }

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
          <p className="text-[#4e7397] text-base font-normal leading-normal">{message}</p>
        </div>

        <div className="p-4 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
} 