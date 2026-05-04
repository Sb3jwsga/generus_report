import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <img 
        src="/logo_ppg.png" 
        alt="PPG Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}
