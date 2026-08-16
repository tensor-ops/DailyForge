export type NotificationType =
  | 'DAILY_SPARK'
  | 'HABIT_REMINDER'
  | 'STREAK_AT_RISK'
  | 'STREAK_MILESTONE'
  | 'PERSONAL_BEST'
  | 'CONSISTENCY_CHANGE'
  | 'MOMENTUM_CHANGE'
  | 'STABILITY_RISK'
  | 'FRICTION_ALERT'
  | 'NEW_DISCOVERY'
  | 'GOAL_UPDATE'
  | 'MILESTONE'
  | 'WEEKLY_SUMMARY'
  | 'DAILY_CHECKIN';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type NotificationFilter = 'all' | 'unread' | 'insights' | 'alerts' | 'milestones';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  expiresAt?: string | null;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
}
