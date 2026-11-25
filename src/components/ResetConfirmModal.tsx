import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#2B1613] border border-[#3E201B] rounded-3xl w-full max-w-md p-7 shadow-2xl">
        <div className="flex items-center gap-3 text-[#F87171] mb-4">
          <div className="p-3 bg-[#F87171]/15 rounded-2xl border border-[#F87171]/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-[#FFFFFF]">Reset to Original Data?</h3>
        </div>

        <p className="text-xs text-[#C4ABA1] leading-relaxed mb-6 font-medium">
          This will restore all campaign spend and attendee numbers to the original 2025 dataset. Any manual edits will be lost. Continue?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-[#C4ABA1] hover:text-[#FFFFFF] hover:bg-[#381D19] rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-black bg-[#F87171] hover:bg-[#F87171]/90 text-[#140A09] rounded-full transition-colors disabled:opacity-50 shadow-lg"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
