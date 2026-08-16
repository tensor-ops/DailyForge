import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Flame,
  Trophy,
  TrendingUp,
  Zap,
  Sparkles,
  AlertTriangle,
  Layers,
  Target,
  BarChart3,
  Moon,
  Clock,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { Notification, NotificationFilter, NotificationType } from '@/types/notification';
import { cn } from '@/utils/cn';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load unread count on mount
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // 1 minute poll
    return () => clearInterval(interval);
  }, []);

  // Fetch full notifications list when panel is opened or filter changes
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard shortcut listener: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Quiet fallback
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications(filter);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // fallback
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // fallback
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // fallback
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'STREAK_AT_RISK':
        return <Flame className="h-4 w-4 text-warning fill-warning" />;
      case 'STREAK_MILESTONE':
        return <Flame className="h-4 w-4 text-warning fill-warning" />;
      case 'PERSONAL_BEST':
        return <Trophy className="h-4 w-4 text-amber-400" />;
      case 'CONSISTENCY_CHANGE':
        return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'MOMENTUM_CHANGE':
        return <Zap className="h-4 w-4 text-primary" />;
      case 'STABILITY_RISK':
        return <AlertTriangle className="h-4 w-4 text-danger" />;
      case 'FRICTION_ALERT':
        return <Layers className="h-4 w-4 text-amber-500" />;
      case 'NEW_DISCOVERY':
        return <Sparkles className="h-4 w-4 text-ai" />;
      case 'GOAL_UPDATE':
        return <Target className="h-4 w-4 text-primary" />;
      case 'WEEKLY_SUMMARY':
        return <BarChart3 className="h-4 w-4 text-primary" />;
      case 'DAILY_CHECKIN':
        return <Moon className="h-4 w-4 text-blue-400" />;
      case 'HABIT_REMINDER':
      default:
        return <Clock className="h-4 w-4 text-primary" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const FILTER_TABS: { value: NotificationFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'insights', label: 'Insights' },
    { value: 'alerts', label: 'Alerts' },
    { value: 'milestones', label: 'Milestones' },
  ];

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : 'Notifications'
        }
        aria-expanded={isOpen}
        className={cn(
          'relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer',
          isOpen && 'bg-muted text-foreground'
        )}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 z-50 w-[calc(100vw-32px)] sm:w-96 max-w-sm rounded-2xl bg-surface/95 backdrop-blur-xl border border-border shadow-2xl overflow-hidden motion-safe:animate-fade-in text-left'
          )}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-border/80 flex items-center justify-between bg-surface-elevated/40">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Intelligence Feed
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary/15 text-primary border border-primary/20 font-extrabold px-1.5 py-0.2 rounded-full font-mono">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-border/40 overflow-x-auto no-scrollbar bg-surface-sunken/30">
            {FILTER_TABS.map((tab) => {
              const isSelected = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-7 w-7 rounded-xl bg-muted/60 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 bg-muted/60 rounded" />
                      <div className="h-2.5 w-full bg-muted/40 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center text-xs space-y-2">
                <p className="text-muted-foreground">{error}</p>
                <button
                  onClick={loadNotifications}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <div className="p-8 text-center space-y-2">
                <div className="text-2xl">✨</div>
                <h4 className="text-xs font-extrabold text-foreground">
                  You're all caught up
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                  Daily Forge will surface meaningful changes when there's something worth your attention.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                if (notif.type === 'DAILY_SPARK') {
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        'p-4 flex items-start gap-3 transition-all cursor-pointer group relative border-l-2',
                        notif.isRead
                          ? 'border-transparent bg-surface-elevated/30 hover:bg-surface-elevated/60'
                          : 'border-primary bg-primary/[0.08] hover:bg-primary/[0.12]'
                      )}
                    >
                      {/* Spark Icon */}
                      <div className="p-2 rounded-xl bg-primary/15 border border-primary/30 text-primary shrink-0 shadow-sm mt-0.5">
                        <Flame className="h-4 w-4 fill-primary" />
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <span>Daily Forge Spark</span>
                            {notif.metadata?.contextState && notif.metadata.contextState !== 'NEUTRAL' && (
                              <span className="text-[9px] bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded-full font-mono text-primary/80">
                                {notif.metadata.contextState.replace('_', ' ')}
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {!notif.isRead && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                            )}
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-foreground italic leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between pt-0.5 text-[10px] text-muted-foreground">
                          <span className="font-semibold text-foreground/80">
                            — {notif.metadata?.attribution || 'Daily Forge'}
                          </span>
                          <span className="text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            <span>Dashboard</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>

                      {/* Quick Delete */}
                      <button
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-danger rounded transition-all cursor-pointer shrink-0"
                        title="Dismiss"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative',
                      notif.isRead
                        ? 'bg-transparent hover:bg-surface-elevated/50'
                        : 'bg-primary/[0.04] hover:bg-primary/[0.08]'
                    )}
                  >
                    {/* Category Icon */}
                    <div className="p-2 rounded-xl bg-surface-elevated border border-border/80 shrink-0 mt-0.5">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={cn(
                            'text-xs font-bold leading-tight truncate',
                            notif.isRead ? 'text-foreground' : 'text-foreground font-extrabold'
                          )}
                        >
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-muted-foreground/70 font-mono">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                        {notif.actionUrl && (
                          <span className="text-[10px] text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            <span>Action</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Delete */}
                    <button
                      onClick={(e) => handleDeleteNotification(notif.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-danger rounded transition-all cursor-pointer shrink-0"
                      title="Dismiss"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
