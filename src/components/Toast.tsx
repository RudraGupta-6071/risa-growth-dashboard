import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#2B1613] border border-[#F6C445]/60 px-5 py-3.5 rounded-full shadow-2xl text-xs font-bold animate-fade-in text-[#FFFFFF]">
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0" />
      )}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-[#C4ABA1] hover:text-[#FFFFFF] transition-colors p-1 rounded-full hover:bg-[#381D19]"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
