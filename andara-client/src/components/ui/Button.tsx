import React from 'react';
import './Button.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  disabled = false,
  onClick,
  children,
  type = 'button',
  className = '',
}) => {
  const baseClass = 'andara-button';
  const variantClass = `andara-button--${variant}`;
  const disabledClass = disabled ? 'andara-button--disabled' : '';
  const combinedClass = `${baseClass} ${variantClass} ${disabledClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

