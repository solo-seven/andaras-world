import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Calculate tooltip position after it's rendered to the DOM
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  // Use useCallback to ensure stable function references
  const showTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      if (triggerRef.current) {
        // Set visible first, then position will be calculated in useEffect
        setIsVisible(true);
      }
    }, delay);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // React's focus events don't bubble, so we need to attach handlers directly to focusable children
  // Check if the child is a native focusable element (button, a, input, etc.)
  const isNativeFocusable = React.isValidElement(children) && 
    typeof children.type === 'string' && 
    ['button', 'a', 'input', 'select', 'textarea'].includes(children.type);

  // Check if child explicitly has tabIndex (making it focusable)
  const hasExplicitTabIndex = React.isValidElement(children) && 
    (children.props as any)?.tabIndex !== undefined;

  // If child is a React element (component or native), clone it to add focus/blur handlers
  // This ensures focus events are captured even when the child is a React component
  // React focus events don't bubble, so handlers on the wrapper won't fire for child focus
  // Use useMemo to recreate handlers when children change, avoiding stale closure issues
  const childWithHandlers = useMemo(() => {
    if (!React.isValidElement(children)) {
      return children;
    }

    const currentChildren = children as React.ReactElement<any>;
    const originalOnFocus = currentChildren.props.onFocus;
    const originalOnBlur = currentChildren.props.onBlur;

    return React.cloneElement(currentChildren, {
      onFocus: (e: React.FocusEvent) => {
        showTooltip();
        // Call original onFocus if it exists (read from current children, not closure)
        if (originalOnFocus) {
          originalOnFocus(e);
        }
      },
      onBlur: (e: React.FocusEvent) => {
        hideTooltip();
        // Call original onBlur if it exists (read from current children, not closure)
        if (originalOnBlur) {
          originalOnBlur(e);
        }
      },
    });
  }, [children, showTooltip, hideTooltip]);

  // Only make wrapper focusable if child is not a React element or is not focusable
  // If child is a React element (component or native focusable), handlers are on the child
  const isChildReactElement = React.isValidElement(children);
  const shouldMakeWrapperFocusable = !isChildReactElement || (!isNativeFocusable && !hasExplicitTabIndex);

  return (
    <div
      ref={triggerRef}
      className={`andara-tooltip-trigger ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      // Only add focus/blur handlers to wrapper if child is not a React element
      // If child is a React element, handlers are attached directly to the child via cloneElement
      onFocus={isChildReactElement ? undefined : showTooltip}
      onBlur={isChildReactElement ? undefined : hideTooltip}
      // Make wrapper focusable if child is not a React element or is not focusable
      // This ensures keyboard users can trigger the tooltip for non-focusable children
      tabIndex={shouldMakeWrapperFocusable ? 0 : undefined}
    >
      {childWithHandlers}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`andara-tooltip andara-tooltip--${position}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};
