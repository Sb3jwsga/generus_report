interface IconProps {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
}

export function Icon({ name, size = 20, filled = false, className = '' }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
