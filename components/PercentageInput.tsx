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
  showSlider?: boolean;
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
  showSlider = false,
}: PercentageInputProps) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw === '' ? 0 : Math.min(100, Math.max(0, parseInt(raw, 10)));
    onChange(num);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label htmlFor={id} className="block text-sm font-medium text-slate-700">
            {label}
          </label>
          {tooltip && (
            <span className="text-slate-400 hover:text-slate-600 cursor-help" title={tooltip}>
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        {showSlider && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            {safeValue}%
          </span>
        )}
      </div>

      {showSlider ? (
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 space-y-1">
              <div className="relative flex items-center">
                <input
                  type="range"
                  id={id}
                  name={id}
                  min={0}
                  max={100}
                  step={1}
                  disabled={disabled}
                  value={safeValue}
                  onChange={(e) => onChange(parseInt(e.target.value, 10))}
                  style={{
                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${safeValue}%, #e2e8f0 ${safeValue}%, #e2e8f0 100%)`,
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={safeValue}
                  aria-label={label}
                />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 font-mono px-0.5">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {presets && presets.length > 0 && (
              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                {presets.map((p) => {
                  const isSelected = safeValue === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange(p)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                      } disabled:opacity-50`}
                    >
                      {p}%
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="relative rounded-lg shadow-2xs flex-1">
            <input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              name={id}
              id={id}
              disabled={disabled}
              value={safeValue}
              onKeyDown={handleKeyDown}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 pl-3 pr-8 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600 sm:text-sm font-mono disabled:bg-slate-100 disabled:text-slate-400 transition-colors"
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
                    safeValue === p
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
      )}

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
