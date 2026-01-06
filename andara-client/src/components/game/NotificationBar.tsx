import React, { useMemo, useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import type { Notification } from '../../store/slices/uiSlice';
import './NotificationBar.css';

interface DisplayNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

export const NotificationBar: React.FC = () => {
  const notifications = useAppSelector((state) => state.ui.notifications);
  
  // Use useMemo to avoid unnecessary recalculations and ensure stable references
  // Notifications already have stable IDs from Redux state (set by addNotification reducer),
  // so we use them directly instead of regenerating IDs
  const displayedNotifications = useMemo<DisplayNotification[]>(() => {
    return notifications
      .slice(-20) // Show only the last 20 notifications
      .filter((notif): notif is Notification & { id: string } => {
        // Type guard: ensure notification has required properties including id
        // The addNotification reducer always sets an id, but TypeScript doesn't know that
        return (
          notif != null &&
          typeof notif === 'object' &&
          'id' in notif &&
          'type' in notif &&
          'message' in notif &&
          typeof notif.id === 'string' &&
          typeof notif.message === 'string'
        );
      })
      .map((notif) => ({
        // Use existing stable ID from Redux state (already guaranteed by filter)
        id: notif.id,
        type: notif.type || 'info',
        message: notif.message,
        timestamp: notif.timestamp || Date.now(),
      }));
  }, [notifications]);

  return (
    <div className="notification-bar" role="log" aria-live="polite" aria-atomic="false">
      {displayedNotifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: DisplayNotification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`notification-bar__item notification-bar__item--${notification.type} ${
        isExpanded ? 'notification-bar__item--expanded' : ''
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
      role="alert"
    >
      <div className="notification-bar__message">{notification.message}</div>
      {isExpanded && (
        <div className="notification-bar__timestamp">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
