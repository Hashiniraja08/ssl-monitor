import React, { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full ${maxWidth} bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200`}>
        {title && (
          <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/20 bg-surface-container/50">
            <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}
        <div className="p-lg">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
