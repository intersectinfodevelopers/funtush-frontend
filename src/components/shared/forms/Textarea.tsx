// src/components/shared/forms/Textarea.tsx
"use client";
import React, { forwardRef,useRef, useState } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  autoResize?: boolean;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, autoResize = true, error, maxLength, className = '', onChange, ...props }, ref) => {
    const [charCount, setCharCount] = useState(0);
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      
      if (autoResize && localRef.current) {
        localRef.current.style.height = 'auto';
        localRef.current.style.height = `${localRef.current.scrollHeight}px`;
      }

      if (onChange) onChange(e);
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex justify-between items-center">
          {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
          {maxLength && (
            <span className="text-xs text-gray-400">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={(node) => {
            localRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          }}
          maxLength={maxLength}
          onChange={handleTextareaChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md text-sm shadow-sm resize-none transition-all
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
            ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';