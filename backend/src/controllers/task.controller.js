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

module.exports = { create };
