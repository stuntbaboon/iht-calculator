'use client';

import React from 'react';
import { Info } from 'lucide-react';

interface PercentageInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  helperText?: string;
  tooltip?: string;
  presets?: number[];
  disabled?: boolean;
}

export function PercentageInput({
  id,
  label,
  value,
  onChange,
  helperText,
  tooltip,
  presets = [0, 50, 100],
  disabled = false,
}: PercentageInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw === '' ? 0 : Math.min(100, Math.max(0, parseInt(raw, 10)));
    onChange(num);
  };

  return (
    <div className="space-y-1.5">
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

      <div className="flex items-center space-x-2">
        <div className="relative rounded-lg shadow-xs flex-1">
          <input
            type="number"
            min={0}
            max={100}
            name={id}
            id={id}
            disabled={disabled}
            value={value || 0}
            onChange={handleChange}
            className="block w-full rounded-lg border border-slate-300 pl-3 pr-8 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600 sm:text-sm disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-slate-500 font-medium sm:text-sm">%</span>
          </div>
        </div>

        {presets && presets.length > 0 && (
          <div className="flex space-x-1">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => onChange(p)}
                className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  value === p
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                {p}%
              </button>
            ))}
          </div>
        )}
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
