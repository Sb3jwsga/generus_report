interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  };
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed shadow-sm font-bold',
    danger: 'bg-error text-white hover:bg-error/90',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
