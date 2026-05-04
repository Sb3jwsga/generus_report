import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  const [error, setError] = useState(false);

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* Background/Placeholder */}
      {!error && (
        <div className="absolute inset-0 bg-brand-primary/5 animate-pulse" />
      )}
      
      {error ? (
        <div className="flex items-center justify-center bg-brand-primary text-white font-serif font-bold text-lg rounded-lg w-full h-full shadow-inner">
          P
        </div>
      ) : (
        <img 
          src="/logo_ppg.png" 
          alt="PPG" 
          className="relative z-10 w-full h-full object-contain transition-opacity duration-300"
          onLoad={(e) => (e.currentTarget.style.opacity = '1')}
          onError={() => setError(true)}
          style={{ opacity: 0 }}
          loading="eager"
        />
      )}
    </div>
  );
}
