import React from 'react';
import './Input.css';

export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password';
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  id?: string;
  name?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  label,
  id,
  name,
  required = false,
  min,
  max,
  step,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="andara-input-wrapper">
      {label && (
        <label htmlFor={inputId} className="andara-input-label">
          {label}
          {required && <span className="andara-input-required" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        required={required}
        min={min}
        max={max}
        step={step}
        className={`andara-input ${error ? 'andara-input--error' : ''}`}
        aria-label={ariaLabel || label}
        aria-describedby={errorId || ariaDescribedBy}
        aria-invalid={!!error}
        aria-required={required}
      />
      {error && (
        <span id={errorId} className="andara-input-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
