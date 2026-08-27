const Settings = require('../models/Settings');

const NOTIFICATION_TYPE_TO_KEY = {
  task_assigned: 'taskAssigned',
  task_updated: 'taskUpdated',
  task_completed: 'taskCompleted',
  task_overdue: 'taskOverdue',
};

const toPublicSettings = (settings) => ({
  id: settings._id,
  registrationOpen: settings.registrationOpen,
  maintenanceMode: settings.maintenanceMode,
  maintenanceMessage: settings.maintenanceMessage,
  notifications: {
    taskAssigned: settings.notifications.taskAssigned,
    taskUpdated: settings.notifications.taskUpdated,
    taskCompleted: settings.notifications.taskCompleted,
    taskOverdue: settings.notifications.taskOverdue,
  },
  updatedAt: settings.updatedAt,
});

const getOrCreate = async () => {
  const existing = await Settings.findOne({});
  if (existing) return existing;

  // Upsert atomique uniquement quand le document n'existe pas encore : évite la
  // création de plusieurs documents Settings lorsque deux requêtes concurrentes
  // arrivent avant qu'un document n'existe, sans payer le coût d'un findAndModify
  // à chaque lecture une fois le document créé.
  return Settings.findOneAndUpdate({}, { $setOnInsert: {} }, { new: true, upsert: true, setDefaultsOnInsert: true });
};

const getSettings = async () => toPublicSettings(await getOrCreate());

const getPublicSettings = async () => {
  const settings = await getOrCreate();
  return {
    registrationOpen: settings.registrationOpen,
    maintenanceMode: settings.maintenanceMode,
    maintenanceMessage: settings.maintenanceMessage,
  };
};

const updateSettings = async (data, adminId) => {
  const settings = await getOrCreate();

  if (data.registrationOpen !== undefined) settings.registrationOpen = data.registrationOpen;
  if (data.maintenanceMode !== undefined) settings.maintenanceMode = data.maintenanceMode;
  if (data.maintenanceMessage !== undefined) settings.maintenanceMessage = data.maintenanceMessage;
  if (data.notifications) {
    Object.assign(settings.notifications, data.notifications);
  }
  settings.updatedBy = adminId;

  await settings.save();
  return toPublicSettings(settings);
};

const isNotificationTypeEnabled = async (type) => {
  const key = NOTIFICATION_TYPE_TO_KEY[type];
  if (!key) return true;
  const settings = await getOrCreate();
  return settings.notifications[key] !== false;
};

module.exports = {
  getSettings,
  getPublicSettings,
  updateSettings,
  isNotificationTypeEnabled,
};
