import React from "react";
import { RxCross2 } from "react-icons/rx";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#09090b]/60 backdrop-blur-sm z-55 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-transparent rounded-2xl max-w-sm w-full overflow-hidden p-8 relative space-y-6 pointer-events-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-zinc-650 hover:text-white transition-colors p-1.5 rounded-lg"
        >
          <RxCross2 className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer Action Row (No border separators, completely seamless!) */}
        <div className="flex justify-end items-center space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-550 hover:text-white text-xs font-bold transition-all py-2"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
              isDestructive
                ? "btn-red-glossy text-white"
                : "btn-cyan-glossy text-white"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
