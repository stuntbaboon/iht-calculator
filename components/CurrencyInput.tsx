'use client';

import React, { useState, useRef } from 'react';
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
  const [prevValue, setPrevValue] = useState(value);
  const [localDisplay, setLocalDisplay] = useState(
    value ? value.toLocaleString('en-GB') : ''
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize with external value changes (e.g. sample estates, resets)
  if (value !== prevValue) {
    setPrevValue(value);
    setLocalDisplay(value ? value.toLocaleString('en-GB') : '');
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation/editing keys: Backspace, Delete, Tab, ArrowLeft, ArrowRight, Home, End, Enter
    if (
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block any non-digit character (including '.', '-', 'e', letters, symbols, space)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const oldVal = input.value;
    const cursor = input.selectionStart || 0;

    // Count how many digits are before the cursor in the current input
    const digitsBeforeCursor = oldVal.slice(0, cursor).replace(/[^0-9]/g, '').length;

    const raw = oldVal.replace(/[^0-9]/g, '');
    if (!raw) {
      setPrevValue(0);
      setLocalDisplay('');
      onChange(0);
      return;
    }

    const num = parseInt(raw, 10);
    const validNum = isNaN(num) ? 0 : num;
    const formatted = validNum === 0 ? '0' : validNum.toLocaleString('en-GB');
    setPrevValue(validNum);
    setLocalDisplay(formatted);
    onChange(validNum);

    // Maintain cursor position relative to digits
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      let newCursor = 0;
      let digitCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/[0-9]/.test(formatted[i])) {
          digitCount++;
        }
        if (digitCount === digitsBeforeCursor) {
          newCursor = i + 1;
          break;
        }
      }
      if (digitCount < digitsBeforeCursor) {
        newCursor = formatted.length;
      }
      inputRef.current.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleBlur = () => {
    if (value === 0) {
      setLocalDisplay('');
    } else {
      setLocalDisplay(value.toLocaleString('en-GB'));
    }
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

      <div className="relative rounded-lg shadow-2xs">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-slate-500 font-medium text-xs sm:text-sm">£</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9,]*"
          name={id}
          id={id}
          disabled={disabled}
          value={localDisplay}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full text-sm rounded-lg border border-slate-300 pl-7 pr-3 py-2 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
        />
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
