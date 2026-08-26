const Notification = require('../models/Notification');
const ApiError = require('../errors/ApiError');
const settingsService = require('./settings.service');

const PUBLIC_FIELDS = ['_id', 'user', 'type', 'title', 'message', 'relatedTask', 'read', 'createdAt', 'updatedAt'];

const toPublicNotification = (notification) => {
  const publicNotification = {};
  PUBLIC_FIELDS.forEach((field) => {
    publicNotification[field === '_id' ? 'id' : field] = notification[field];
  });
  return publicNotification;
};

const create = async ({ user, type, title, message, relatedTask = null }) => {
  const enabled = await settingsService.isNotificationTypeEnabled(type);
  if (!enabled) return null;

  const notification = await Notification.create({ user, type, title, message, relatedTask });
  return toPublicNotification(notification);
};

const list = async (currentUser, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const filter = { user: currentUser._id };
  if (unreadOnly) filter.read = false;

  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return {
    notifications: notifications.map(toPublicNotification),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

const getUnreadCount = async (currentUser) => Notification.countDocuments({ user: currentUser._id, read: false });

const findOwnedOrThrow = async (id, currentUser) => {
  const notification = await Notification.findById(id);
  if (!notification || notification.user.toString() !== currentUser._id.toString()) {
    throw ApiError.notFound('Notification introuvable.');
  }
  return notification;
};

const markAsRead = async (id, currentUser) => {
  const notification = await findOwnedOrThrow(id, currentUser);
  notification.read = true;
  await notification.save();
  return toPublicNotification(notification);
};

const markAllAsRead = async (currentUser) => {
  await Notification.updateMany({ user: currentUser._id, read: false }, { $set: { read: true } });
};

const remove = async (id, currentUser) => {
  const notification = await findOwnedOrThrow(id, currentUser);
  await notification.deleteOne();
};

module.exports = { create, list, getUnreadCount, markAsRead, markAllAsRead, remove };
