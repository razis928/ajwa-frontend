import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  children,
  maxWidth = 'max-w-sm',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} overflow-hidden shadow-2xl border border-amber-200/50 animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-ajwa-gold/15 flex justify-between items-center bg-gradient-to-r from-ajwa-forest to-ajwa-forest-light">
          <h3 id="modal-title" className="font-semibold text-ajwa-gold-light text-sm tracking-wide">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
