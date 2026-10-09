import logoImg from '../../assets/logo.png';

interface LogoProps {
  width?: number;
  height?: number;
  variant?: 'full' | 'icon';
  className?: string;
}

export function Logo({ width = 160, height = 40, variant = 'full', className = '' }: LogoProps) {
  const h = variant === 'icon' ? 32 : height;
  return (
    <img
      src={logoImg}
      alt="Logo Generus"
      className={`object-contain ${className}`}
      style={{ height: h, width: 'auto', maxWidth: width }}
    />
  );
}
