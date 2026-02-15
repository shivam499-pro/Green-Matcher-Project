/**
 * Green Matchers - Notification Center Component
 * Displays user notifications with read/unread status
 */
import React, { useState, useEffect } from 'react';
import { preferencesAPI } from '../../utils/api';
import { useI18n } from '../../contexts/I18nContext';
import LoadingSpinner from './LoadingSpinner';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await preferencesAPI.getNotifications(filter === 'unread', 1, 20);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await preferencesAPI.markNotificationRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await preferencesAPI.deleteNotification(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return '📝';
      case 'job':
        return '💼';
      case 'alert':
        return '🔔';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center" onClick={(e) => e.stopPropagation()}>
        <div className="notification-header">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="notification-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="notification-list">
          {loading ? (
            <LoadingSpinner />
          ) : notifications.length === 0 ? (
            <div className="no-notifications">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="notification-actions">
                  {!notification.is_read && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleMarkRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(notification.id)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Notification Bell Component for Navigation
export const NotificationBell = ({ onClick, unreadCount }) => {
  return (
    <button className="notification-bell" onClick={onClick}>
      🔔
      {unreadCount > 0 && (
        <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
      )}
    </button>
  );
};

export default NotificationCenter;
