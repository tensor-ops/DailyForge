const Notification = require('../models/Notification');
const Habit = require('../models/Habit');
const { calculateHabitStats } = require('./streak.service');
const { getBehaviorAnalytics } = require('./analytics.service');
const { evaluateNotificationRules } = require('./notificationRules.service');
const { NotFoundError, AuthorizationError } = require('../utils/errors');

const PRIORITY_ORDER = {
  CRITICAL: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1,
};

async function syncNotifications(userId) {
  try {
    const rawHabits = await Habit.find({ userId, isArchived: false }).lean();
    const formattedHabits = await Promise.all(
      rawHabits.map(async (h) => {
        const stats = await calculateHabitStats(h._id, userId, h.startDate);
        return {
          ...h,
          currentStreak: stats.currentStreak,
          longestStreak: stats.longestStreak,
          completedToday: stats.completedToday,
          completionRate: stats.completionRate,
        };
      })
    );

    const behaviorData = await getBehaviorAnalytics(userId, '30d').catch(() => null);

    const candidateNotifications = evaluateNotificationRules(userId, formattedHabits, behaviorData);

    for (const candidate of candidateNotifications) {
      // Upsert based on dedupKey to prevent duplicate spams
      await Notification.findOneAndUpdate(
        { userId, dedupKey: candidate.dedupKey },
        { $setOnInsert: candidate },
        { upsert: true, new: false }
      );
    }
  } catch (err) {
    console.error('Notification sync error:', err.message);
  }
}

async function getNotifications(userId, options = {}) {
  const { filter = 'all', limit = 30 } = options;

  // Run lightweight sync to ensure latest behavioral alerts are present
  await syncNotifications(userId);

  const query = { userId };

  if (filter === 'unread') {
    query.isRead = false;
  } else if (filter === 'insights') {
    query.type = { $in: ['NEW_DISCOVERY', 'CONSISTENCY_CHANGE', 'MOMENTUM_CHANGE'] };
  } else if (filter === 'alerts') {
    query.type = { $in: ['STREAK_AT_RISK', 'STABILITY_RISK', 'FRICTION_ALERT', 'HABIT_REMINDER'] };
  } else if (filter === 'milestones') {
    query.type = { $in: ['STREAK_MILESTONE', 'PERSONAL_BEST', 'MILESTONE', 'GOAL_UPDATE'] };
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  // Sort by priority weight then createdAt
  notifications.sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority] || 1;
    const pB = PRIORITY_ORDER[b.priority] || 1;
    if (pB !== pA) return pB - pA;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return {
    notifications: notifications.map(formatNotificationResponse),
    unreadCount,
  };
}

async function getUnreadCount(userId) {
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  return { unreadCount };
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }
  if (notification.userId.toString() !== userId.toString()) {
    throw new AuthorizationError('Unauthorized');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  return { notification: formatNotificationResponse(notification.toObject()), unreadCount };
}

async function markAllAsRead(userId) {
  await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return { unreadCount: 0 };
}

async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }
  if (notification.userId.toString() !== userId.toString()) {
    throw new AuthorizationError('Unauthorized');
  }

  await Notification.deleteOne({ _id: notificationId });
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  return { id: notificationId, unreadCount };
}

function formatNotificationResponse(notif) {
  return {
    id: notif._id ? notif._id.toString() : notif.id,
    userId: notif.userId.toString(),
    type: notif.type,
    priority: notif.priority,
    title: notif.title,
    message: notif.message,
    entityType: notif.entityType,
    entityId: notif.entityId,
    actionUrl: notif.actionUrl,
    metadata: notif.metadata || {},
    isRead: Boolean(notif.isRead),
    createdAt: notif.createdAt ? new Date(notif.createdAt).toISOString() : new Date().toISOString(),
    readAt: notif.readAt ? new Date(notif.readAt).toISOString() : null,
  };
}

module.exports = {
  syncNotifications,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
