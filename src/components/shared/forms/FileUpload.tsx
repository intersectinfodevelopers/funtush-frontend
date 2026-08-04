// src/components/shared/forms/FileUpload.tsx
"use client";
import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface FileUploadProps {
  label?: string;
  accept?: string[];
  maxSizeMB?: number;
  onChange: (files: File[]) => void;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, accept, maxSizeMB = 5, onChange, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      // Basic type validation check
      if (accept && !accept.some(type => file.type.includes(type.replace('*', '')))) return;
      // Size check
      if (file.size > maxSizeMB * 1024 * 1024) return;

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setPreviews(prev => [...prev, ...newPreviews]);
    onChange(validFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-5 g-opacity-10' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500' : ''}`}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          aria-label="Upload files"
          title="Upload files"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
        <p className="text-sm text-gray-600">Drag & drop files here, or <span className="text-blue-500 font-semibold">browse</span></p>
        <p className="text-xs text-gray-400 mt-1">Max file size: {maxSizeMB}MB</p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {previews.map((src, i) => (
            <div key={i} className="relative group border rounded-md overflow-hidden aspect-square">
              <Image src={src} alt="preview" className="w-full h-full object-cover" />
              <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </div>
          ))}
        </div>
      )}
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};