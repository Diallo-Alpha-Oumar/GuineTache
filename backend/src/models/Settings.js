const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      trim: true,
      maxlength: [300, 'Le message de maintenance ne peut pas dépasser 300 caractères'],
      default: "L'application est actuellement en maintenance. Merci de réessayer plus tard.",
    },
    notifications: {
      taskAssigned: { type: Boolean, default: true },
      taskUpdated: { type: Boolean, default: true },
      taskCompleted: { type: Boolean, default: true },
      taskOverdue: { type: Boolean, default: true },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
