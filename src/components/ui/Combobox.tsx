import { useState, useEffect, useRef } from 'react';
import { Combobox as HeadlessCombobox, ComboboxButton, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  clearable?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  disabled = false,
  loading = false,
  error,
  clearable = true,
}: ComboboxProps) {
  const [query, setQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const selected = options.find((opt) => opt.value === value);
    setSelectedLabel(selected?.label || '');
    setQuery('');
  }, [value, options]);

  const filteredOptions =
    query === ''
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase())
        );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setSelectedLabel('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFocus = () => {
    setQuery('');
  };

  return (
    <div className="w-full">
      <HeadlessCombobox
        value={value}
        onChange={(val) => {
          onChange(val || '');
          setQuery('');
        }}
        disabled={disabled}
        immediate
      >
        <div className="relative">
          <div className="relative">
            <ComboboxInput
              ref={inputRef}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              displayValue={() => selectedLabel}
              placeholder={placeholder}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-1">
              {loading && (
                <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {!loading && clearable && value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
                  title="Hapus pilihan"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <ComboboxButton className="p-1 text-gray-400 hover:text-gray-700 rounded-md" title="Tampilkan pilihan">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </ComboboxButton>
            </div>
          </div>

          <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white border border-gray-200 shadow-lg focus:outline-none">
            {filteredOptions.length === 0 ? (
              <div className="relative cursor-default select-none px-4 py-3 text-gray-500 text-sm">
                {loading ? 'Memuat data...' : 'Tidak ditemukan'}
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <ComboboxOption
                  key={opt.value}
                  value={opt.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm ${
                      active ? 'bg-primary text-white' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-semibold' : ''}`}>
                        {opt.label}
                      </span>
                      {selected && (
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-primary'}`}>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </HeadlessCombobox>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
