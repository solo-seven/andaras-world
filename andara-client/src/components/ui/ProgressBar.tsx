import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'health' | 'stamina' | 'rift';
  className?: string;
  'aria-label'?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'default',
  className = '',
  'aria-label': ariaLabel,
}) => {
  // Validate max is greater than zero to prevent division by zero or negative values
  // If max is invalid, fallback to 100
  const safeMax = max > 0 ? max : 100;
  
  // Clamp value between 0 and safeMax for both visual display and ARIA compliance
  const clampedValue = Math.min(safeMax, Math.max(0, value));
  
  // Calculate percentage safely (safeMax is guaranteed to be > 0)
  const percentage = (clampedValue / safeMax) * 100;
  // Display value-to-max ratio (e.g., "50/100") instead of percentage to match aria-label format
  const displayValue = showValue ? `${Math.round(clampedValue)}/${Math.round(safeMax)}` : undefined;

  return (
    <div className={`andara-progress-bar ${className}`}>
      {label && <div className="andara-progress-bar-label">{label}</div>}
      <div
        className={`andara-progress-bar-container andara-progress-bar--${variant}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={ariaLabel || label}
      >
        <div
          className="andara-progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
        {displayValue && (
          <span className="andara-progress-bar-value">{displayValue}</span>
        )}
      </div>
    </div>
  );
};
