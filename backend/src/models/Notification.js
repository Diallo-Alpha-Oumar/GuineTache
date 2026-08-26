const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['task_assigned', 'task_updated', 'task_completed', 'task_overdue', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, 'Le titre ne peut pas dépasser 150 caractères'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Le message ne peut pas dépasser 500 caractères'],
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
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

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
