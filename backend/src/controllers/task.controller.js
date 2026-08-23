const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const httpStatus = require('../constants/httpStatus');
const taskService = require('../services/task.service');

const create = catchAsync(async (req, res) => {
  const task = await taskService.create(req.body, req.user._id);
  ApiResponse.success(res, {
    statusCode: httpStatus.CREATED,
    message: 'Tâche créée avec succès.',
    data: { task },
  });
});

const list = catchAsync(async (req, res) => {
  const { tasks, pagination } = await taskService.list(req.query, req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Tâches récupérées avec succès.',
    data: { tasks, pagination },
  });
});

const stats = catchAsync(async (req, res) => {
  const taskStats = await taskService.getStats(req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Statistiques récupérées avec succès.',
    data: { stats: taskStats },
  });
});

const getById = catchAsync(async (req, res) => {
  const task = await taskService.getById(req.params.id, req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Tâche récupérée avec succès.',
    data: { task },
  });
});

const update = catchAsync(async (req, res) => {
  const task = await taskService.update(req.params.id, req.body, req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Tâche mise à jour avec succès.',
    data: { task },
  });
});

const remove = catchAsync(async (req, res) => {
  await taskService.softDelete(req.params.id, req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Tâche supprimée avec succès.',
  });
});

const restore = catchAsync(async (req, res) => {
  const task = await taskService.restore(req.params.id, req.user);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Tâche restaurée avec succès.',
    data: { task },
  });
});

module.exports = { create, list, stats, getById, update, remove, restore };
