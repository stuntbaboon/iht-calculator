'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  helperText?: string;
  tooltip?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  id,
  label,
  value,
  onChange,
  helperText,
  tooltip,
  placeholder = '0',
  disabled = false,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localInput, setLocalInput] = useState('');

  const display = isFocused
    ? localInput
    : value
    ? value.toLocaleString('en-GB')
    : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setLocalInput(raw);
    const num = raw === '' ? 0 : parseInt(raw, 10);
    onChange(num);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setLocalInput(value ? value.toString() : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
        {tooltip && (
          <span className="text-slate-400 hover:text-slate-600 cursor-help" title={tooltip}>
            <Info className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      <div className="relative rounded-lg shadow-xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-slate-500 font-medium sm:text-sm">£</span>
        </div>
        <input
          type="text"
          name={id}
          id={id}
          disabled={disabled}
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600 sm:text-sm disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
        />
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
