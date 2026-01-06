import React from 'react';
import './Panel.css';

export interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export interface PanelHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface PanelBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface PanelFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ children, className = '' }) => {
  return <div className={`andara-panel ${className}`}>{children}</div>;
};

export const PanelHeader: React.FC<PanelHeaderProps> = ({ children, className = '' }) => {
  return <div className={`andara-panel-header ${className}`}>{children}</div>;
};

export const PanelBody: React.FC<PanelBodyProps> = ({ children, className = '' }) => {
  return <div className={`andara-panel-body ${className}`}>{children}</div>;
};

export const PanelFooter: React.FC<PanelFooterProps> = ({ children, className = '' }) => {
  return <div className={`andara-panel-footer ${className}`}>{children}</div>;
};
