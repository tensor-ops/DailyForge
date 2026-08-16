const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');

async function getNotifications(req, res, next) {
  try {
    const data = await notificationService.getNotifications(req.user._id, req.query);
    return sendSuccess(res, data, 'Notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const data = await notificationService.getUnreadCount(req.user._id);
    return sendSuccess(res, data, 'Unread count retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function markAsRead(req, res, next) {
  try {
    const data = await notificationService.markAsRead(req.params.id, req.user._id);
    return sendSuccess(res, data, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const data = await notificationService.markAllAsRead(req.user._id);
    return sendSuccess(res, data, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const data = await notificationService.deleteNotification(req.params.id, req.user._id);
    return sendSuccess(res, data, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
