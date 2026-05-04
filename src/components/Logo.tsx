import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {hasError ? (
        <div 
          className="flex items-center justify-center bg-brand-primary/10 rounded-xl"
          style={{ width: size, height: size }}
        >
          <Shield size={size * 0.6} className="text-brand-primary" />
        </div>
      ) : (
        <img 
          src="/logo_ppg.png" 
          alt="Logo" 
          className="max-w-full max-h-full object-contain"
          loading="eager"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
