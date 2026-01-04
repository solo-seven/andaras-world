import React from 'react';
import './ErrorBanner.css';

export interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <div className="error-banner" role="alert">
      <div className="error-banner__content">
        <span className="error-banner__icon">⚠</span>
        <span className="error-banner__message">{message}</span>
      </div>
      {onDismiss && (
        <button
          className="error-banner__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
};
