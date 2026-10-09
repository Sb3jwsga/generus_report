interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border bg-white py-2.5 px-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 transition-all ${
          error ? 'border-error focus:border-error' : 'border-gray-300 focus:border-primary'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-error font-medium">{error}</p>}
    </div>
  );
}
