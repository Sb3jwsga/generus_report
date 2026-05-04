import React from 'react';
import logoUrl from '../assets/logo_ppg.png';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <img 
        src={logoUrl} 
        alt="PPG Logo" 
        className="block w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
