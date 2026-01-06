import React from 'react';
import './Button.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  disabled = false,
  onClick,
  children,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
}) => {
  const baseClass = 'andara-button';
  // Secondary variant uses base styles (no additional class needed)
  const variantClass = variant === 'secondary' ? '' : `andara-button--${variant}`;
  const disabledClass = disabled ? 'andara-button--disabled' : '';
  const combinedClass = `${baseClass} ${variantClass} ${disabledClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

