"use client";
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, size = 'md', children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Target Content Modal Wrapper */}
      <div className={cn('relative w-full bg-white rounded-lg shadow-md border border-neutral-200 flex flex-col max-h-[90vh] z-10 duration-150 animate-in fade-in zoom-in-95', sizes[size])}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          {title && <h3 className="text-lg font-bold text-neutral-900">{title}</h3>}
          <button onClick={onClose} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};