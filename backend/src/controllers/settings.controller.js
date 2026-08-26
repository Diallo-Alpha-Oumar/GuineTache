const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const settingsService = require('../services/settings.service');

const getPublicSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.getPublicSettings();
  ApiResponse.success(res, {
    message: 'Paramètres publics récupérés avec succès.',
    data: { settings },
  });
});

const getSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.getSettings();
  ApiResponse.success(res, {
    message: 'Paramètres récupérés avec succès.',
    data: { settings },
  });
});

const updateSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body, req.user._id);
  ApiResponse.success(res, {
    message: 'Paramètres mis à jour avec succès.',
    data: { settings },
  });
});

module.exports = { getPublicSettings, getSettings, updateSettings };
