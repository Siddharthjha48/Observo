import React, { useEffect } from 'react';
import { Card } from './card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-150">
        <Card className="p-0 border-3 border-black shadow-neo-lg overflow-hidden">
          {/* Header Bar */}
          <div className="bg-neo-yellow border-b-2 border-black p-4 flex justify-between items-center">
            <h3 className="font-black text-lg uppercase tracking-wide font-mono text-black">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="border-2 border-black bg-white hover:bg-neo-coral p-1.5 transition-all text-xs font-bold leading-none select-none cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
            >
              ✕
            </button>
          </div>
          {/* Content Area */}
          <div className="p-6 bg-white max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};
