import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PasswordDisplayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  password: string;
  userName: string;
}

const PasswordDisplayDialog: React.FC<PasswordDisplayDialogProps> = ({
  isOpen,
  onClose,
  password,
  userName
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.5)]" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 md:mx-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#0e141b]">Mật khẩu mới</h2>
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

        <div className="p-6">
          <p className="text-[#4e7397] text-base font-normal leading-normal mb-4">
            Mật khẩu mới cho tài khoản <span className="font-semibold text-[#0e141b]">{userName}</span>:
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono text-[#0e141b] select-all">{password}</code>
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className="ml-2 h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Vui lòng lưu lại mật khẩu này. Mật khẩu sẽ không được hiển thị lại.
            </p>
          </div>
        </div>

        <div className="p-4 flex justify-end">
          <Button
            onClick={onClose}
            className="px-4 py-2 bg-[#1980e6] text-white rounded-md hover:bg-[#1565c0] transition"
          >
            Đã hiểu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordDisplayDialog; 