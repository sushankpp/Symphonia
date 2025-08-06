import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Bell,
  Music,
  Heart,
  MessageSquare,
  Download,
  Clock,
} from "lucide-react";
import TopHeader from "../components/ui/headers/TopHeader";
import SidebarHeader from "../components/ui/headers/SidebarHeader";

interface Notification {
  id: number;
  type: 'new_song' | 'like' | 'comment' | 'download' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: React.ReactNode;
}

const Notifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'new_song',
      title: 'New Song Available',
      message: 'Artist "John Doe" has uploaded a new song "Summer Vibes"',
      timestamp: '2 hours ago',
      isRead: false,
      icon: <Music size={20} />
    },
    {
      id: 2,
      type: 'like',
      title: 'New Like',
      message: 'Someone liked your song "Midnight Dreams"',
      timestamp: '5 hours ago',
      isRead: false,
      icon: <Heart size={20} />
    },
    {
      id: 3,
      type: 'comment',
      title: 'New Comment',
      message: 'User "MusicLover" commented on your song',
      timestamp: '1 day ago',
      isRead: true,
      icon: <MessageSquare size={20} />
    },
    {
      id: 4,
      type: 'download',
      title: 'Song Downloaded',
      message: 'Your song "Ocean Waves" was downloaded 15 times',
      timestamp: '2 days ago',
      isRead: true,
      icon: <Download size={20} />
    },
    {
      id: 5,
      type: 'system',
      title: 'Welcome to Symphonia',
      message: 'Thank you for joining our music community!',
      timestamp: '1 week ago',
      isRead: true,
      icon: <Bell size={20} />
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_song':
        return <Music size={20} className="notification-icon notification-icon--new-song" />;
      case 'like':
        return <Heart size={20} className="notification-icon notification-icon--like" />;
      case 'comment':
        return <MessageSquare size={20} className="notification-icon notification-icon--comment" />;
      case 'download':
        return <Download size={20} className="notification-icon notification-icon--download" />;
      default:
        return <Bell size={20} className="notification-icon notification-icon--system" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isAuthenticated) {
    return (
      <>
        <SidebarHeader />
        <main className="page__home" id="primary">
          <div className="container">
            <TopHeader />
            <div className="notifications-container">
              <div className="notifications-error">
                <h2>Access Denied</h2>
                <p>Please log in to view notifications.</p>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SidebarHeader />
      <main className="page__home" id="primary">
        <div className="container">
          <TopHeader />
          <div className="notifications-container">
            <div className="notifications-header">
              <h1>
                <Bell size={24} />
                Notifications
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </h1>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-read-btn">
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notifications-content">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <Bell size={48} />
                  <h3>No notifications</h3>
                  <p>You're all caught up! Check back later for new updates.</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="notification-icon-wrapper">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-header">
                          <h3>{notification.title}</h3>
                          <span className="notification-time">
                            <Clock size={14} />
                            {notification.timestamp}
                          </span>
                        </div>
                        <p className="notification-message">{notification.message}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="unread-indicator"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Notifications; 