const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const httpStatus = require('../constants/httpStatus');
const notificationService = require('../services/notification.service');

const list = catchAsync(async (req, res) => {
  const { notifications, pagination } = await notificationService.list(req.user, req.query);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Notifications récupérées avec succès.',
    data: { notifications, pagination },
  });
});

const unreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Nombre de notifications non lues récupéré avec succès.',
    data: { count },
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Notification marquée comme lue.',
    data: { notification },
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Toutes les notifications ont été marquées comme lues.',
  });
});

const remove = catchAsync(async (req, res) => {
  await notificationService.remove(req.params.id, req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Notification supprimée avec succès.',
  });
});

module.exports = { list, unreadCount, markAsRead, markAllAsRead, remove };
