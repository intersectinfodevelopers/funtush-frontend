"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  fallback: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, fallback, alt }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100">
      {src && !hasError ? (
        <img 
          src={src} 
          alt={alt || "Avatar"} 
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-600 text-sm font-semibold text-white">
          {fallback}
        </div>
      )}
    </div>
  );
};