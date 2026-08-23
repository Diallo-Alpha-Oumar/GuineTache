const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const httpStatus = require('../constants/httpStatus');
const userService = require('../services/user.service');

const list = catchAsync(async (req, res) => {
  const { users, pagination } = await userService.list(req.query);
  ApiResponse.success(res, {
    message: 'Utilisateurs récupérés avec succès.',
    data: { users, pagination },
  });
});

const getById = catchAsync(async (req, res) => {
  const user = await userService.getById(req.params.id);
  ApiResponse.success(res, {
    message: 'Utilisateur récupéré avec succès.',
    data: { user },
  });
});

const update = catchAsync(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  ApiResponse.success(res, {
    message: 'Utilisateur mis à jour avec succès.',
    data: { user },
  });
});

const toggleActive = catchAsync(async (req, res) => {
  const user = await userService.toggleActive(req.params.id, req.user._id);
  ApiResponse.success(res, {
    message: user.isActive ? 'Utilisateur activé avec succès.' : 'Utilisateur désactivé avec succès.',
    data: { user },
  });
});

const remove = catchAsync(async (req, res) => {
  await userService.remove(req.params.id, req.user._id);
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    message: 'Utilisateur supprimé avec succès.',
  });
});

module.exports = { list, getById, update, toggleActive, remove };
