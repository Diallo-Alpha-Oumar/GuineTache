const Task = require('../models/Task');
const User = require('../models/User');
const ApiError = require('../errors/ApiError');
const notificationService = require('./notification.service');
const logger = require('../config/logger');

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

const isAdmin = (user) => user.role === 'admin';

const notifySafe = async (payload) => {
  try {
    await notificationService.create(payload);
  } catch (error) {
    logger.error(`Échec de création de notification: ${error.message}`);
  }
};

const canAccessTask = (task, user) =>
  isAdmin(user) || task.createdBy.toString() === user._id.toString() || task.assignedTo?.toString() === user._id.toString();

const canManageTask = (task, user) => isAdmin(user) || task.createdBy.toString() === user._id.toString();

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

  if (assignedTo && assignedTo.toString() !== createdById.toString()) {
    void notifySafe({
      user: assignedTo,
      type: 'task_assigned',
      title: 'Nouvelle tâche assignée',
      message: `Une nouvelle tâche vous a été assignée : ${task.title}.`,
      relatedTask: task._id,
    });
  }

  return toPublicTask(task);
};

const list = async ({ status, priority, search, assignedTo, page = 1, limit = 20 }, currentUser) => {
  const filter = { isDeleted: false };

  if (!isAdmin(currentUser)) {
    filter.$or = [{ createdBy: currentUser._id }, { assignedTo: currentUser._id }];
  }
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const skip = (page - 1) * limit;
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  return {
    tasks: tasks.map(toPublicTask),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

const findActiveTaskOrThrow = async (id) => {
  const task = await Task.findById(id);
  if (!task || task.isDeleted) {
    throw ApiError.notFound('Tâche introuvable.');
  }
  return task;
};

const getById = async (id, currentUser) => {
  const task = await findActiveTaskOrThrow(id);
  if (!canAccessTask(task, currentUser)) {
    throw ApiError.forbidden("Vous n'avez pas accès à cette tâche.");
  }
  return toPublicTask(task);
};

const update = async (id, changes, currentUser) => {
  const task = await findActiveTaskOrThrow(id);
  if (!canManageTask(task, currentUser)) {
    throw ApiError.forbidden("Vous n'avez pas le droit de modifier cette tâche.");
  }

  if (changes.assignedTo) {
    const assignee = await User.findById(changes.assignedTo);
    if (!assignee || !assignee.isActive) {
      throw ApiError.badRequest('Utilisateur assigné introuvable ou inactif.');
    }
  }

  const previousAssignedTo = task.assignedTo?.toString() ?? null;
  const actorId = currentUser._id.toString();

  Object.assign(task, changes);
  await task.save();

  const newAssignedTo = task.assignedTo?.toString() ?? null;
  const wasReassigned = 'assignedTo' in changes && newAssignedTo && newAssignedTo !== previousAssignedTo;

  if (wasReassigned && newAssignedTo !== actorId) {
    void notifySafe({
      user: newAssignedTo,
      type: 'task_assigned',
      title: 'Nouvelle tâche assignée',
      message: `Une nouvelle tâche vous a été assignée : ${task.title}.`,
      relatedTask: task._id,
    });
  } else if (newAssignedTo && newAssignedTo !== actorId && !('status' in changes)) {
    void notifySafe({
      user: newAssignedTo,
      type: 'task_updated',
      title: 'Tâche modifiée',
      message: `La tâche "${task.title}" a été mise à jour.`,
      relatedTask: task._id,
    });
  }

  if (changes.status === 'done' && newAssignedTo) {
    void notifySafe({
      user: newAssignedTo,
      type: 'task_completed',
      title: 'Tâche terminée',
      message: `La tâche "${task.title}" a été marquée comme terminée.`,
      relatedTask: task._id,
    });
  }

  return toPublicTask(task);
};

const softDelete = async (id, currentUser) => {
  const task = await Task.findById(id);
  if (!task) {
    throw ApiError.notFound('Tâche introuvable.');
  }
  if (!canManageTask(task, currentUser)) {
    throw ApiError.forbidden("Vous n'avez pas le droit de supprimer cette tâche.");
  }
  if (task.isDeleted) {
    throw ApiError.conflict('Cette tâche a déjà été supprimée.');
  }

  task.isDeleted = true;
  task.deletedAt = new Date();
  task.deletedBy = currentUser._id;
  await task.save();
};

const restore = async (id, currentUser) => {
  if (!isAdmin(currentUser)) {
    throw ApiError.forbidden('Seul un administrateur peut restaurer une tâche.');
  }

  const task = await Task.findById(id);
  if (!task || !task.isDeleted) {
    throw ApiError.notFound('Tâche supprimée introuvable.');
  }

  task.isDeleted = false;
  task.deletedAt = null;
  task.deletedBy = null;
  await task.save();
  return toPublicTask(task);
};

const getStats = async (currentUser) => {
  const filter = { isDeleted: false };
  if (!isAdmin(currentUser)) {
    filter.$or = [{ createdBy: currentUser._id }, { assignedTo: currentUser._id }];
  }

  const tasks = await Task.find(filter).select('status dueDate');
  const now = new Date();

  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    cancelled: tasks.filter((t) => t.status === 'cancelled').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled' && t.dueDate && t.dueDate < now).length,
  };
};

module.exports = { toPublicTask, create, list, getById, update, softDelete, restore, getStats };
