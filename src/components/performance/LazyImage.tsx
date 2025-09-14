/**
 * Optimized lazy loading image component with blur placeholder
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
}

export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (priority || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [priority]);
  
  const handleLoad = () => {
    setHasLoaded(true);
    onLoad?.();
  };
  
  // Generate low-quality placeholder if not provided
  const placeholderUrl = blurDataURL || generateBlurDataURL();
  
  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        minHeight: height || 'auto',
        backgroundColor: hasLoaded ? 'transparent' : '#f3f4f6',
      }}
    >
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            hasLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          placeholder={placeholder}
          blurDataURL={placeholderUrl}
          onLoad={handleLoad}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
      
      {!hasLoaded && (
        <div 
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Generate a simple blur data URL placeholder
 */
function generateBlurDataURL(): string {
  // Simple 1x1 pixel gray image
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg==';
}