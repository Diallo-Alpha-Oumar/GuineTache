const ApiError = require('../errors/ApiError');
const catchAsync = require('../utils/catchAsync');
const settingsService = require('../services/settings.service');

const enforceMaintenanceMode = catchAsync(async (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }

  const { maintenanceMode, maintenanceMessage } = await settingsService.getPublicSettings();
  if (maintenanceMode) {
    throw new ApiError(503, maintenanceMessage || "L'application est actuellement en maintenance.");
  }

  next();
});

module.exports = enforceMaintenanceMode;
