const Task = require('../models/Task');
const User = require('../models/User');
const ApiError = require('../errors/ApiError');

const PUBLIC_TASK_FIELDS = [
  '_id',
  'title',
  'description',
  'status',
  'priority',
  'dueDate',
  'assignedTo',
  'createdBy',
  'createdAt',
  'updatedAt',
];

const toPublicTask = (task) => {
  const publicTask = {};
  PUBLIC_TASK_FIELDS.forEach((field) => {
    publicTask[field === '_id' ? 'id' : field] = task[field];
  });
  return publicTask;
};

const create = async ({ title, description, priority, dueDate, assignedTo }, createdById) => {
  if (assignedTo) {
    const assignee = await User.findById(assignedTo);
    if (!assignee || !assignee.isActive) {
      throw ApiError.badRequest('Utilisateur assigné introuvable ou inactif.');
    }
  }

  const task = await Task.create({
    title,
    description,
    priority,
    dueDate: dueDate ?? null,
    assignedTo: assignedTo ?? null,
    createdBy: createdById,
  });

  return toPublicTask(task);
};

module.exports = { toPublicTask, create };
