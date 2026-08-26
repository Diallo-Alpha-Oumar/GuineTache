jest.mock('../../src/models/Task');
jest.mock('../../src/models/User');
jest.mock('../../src/services/notification.service');

const Task = require('../../src/models/Task');
const User = require('../../src/models/User');
const notificationService = require('../../src/services/notification.service');
const taskService = require('../../src/services/task.service');

const ownerId = '507f1f77bcf86cd799439011';
const assigneeId = '507f1f77bcf86cd799439012';
const otherId = '507f1f77bcf86cd799439013';

describe('task.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it("refuse d'assigner une tâche à un utilisateur introuvable ou inactif", async () => {
      User.findById.mockResolvedValue(null);

      await expect(
        taskService.create({ title: 'Tâche', assignedTo: assigneeId }, ownerId)
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(Task.create).not.toHaveBeenCalled();
    });

    it('crée la tâche et notifie l’utilisateur assigné quand il diffère du créateur', async () => {
      User.findById.mockResolvedValue({ _id: assigneeId, isActive: true });
      Task.create.mockResolvedValue({
        _id: 'task1',
        title: 'Tâche',
        assignedTo: assigneeId,
        createdBy: ownerId,
      });

      const result = await taskService.create({ title: 'Tâche', assignedTo: assigneeId }, ownerId);

      expect(result.id).toBe('task1');
      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({ user: assigneeId, type: 'task_assigned' })
      );
    });

    it("ne notifie personne si le créateur s'assigne la tâche à lui-même", async () => {
      Task.create.mockResolvedValue({ _id: 'task1', title: 'Tâche', assignedTo: ownerId, createdBy: ownerId });

      await taskService.create({ title: 'Tâche', assignedTo: ownerId }, ownerId);

      expect(notificationService.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const buildTask = (overrides = {}) => ({
      _id: 'task1',
      title: 'Tâche',
      status: 'todo',
      createdBy: { toString: () => ownerId },
      assignedTo: null,
      isDeleted: false,
      save: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    });

    it("refuse la modification par un utilisateur qui n'est ni créateur ni admin", async () => {
      const task = buildTask({ createdBy: { toString: () => ownerId } });
      Task.findById.mockResolvedValue(task);

      const currentUser = { _id: otherId, role: 'user' };

      await expect(taskService.update('task1', { title: 'Nouveau titre' }, currentUser)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('notifie le nouvel assigné lors d’une réassignation', async () => {
      const task = buildTask({ assignedTo: { toString: () => otherId } });
      Task.findById.mockResolvedValue(task);
      User.findById.mockResolvedValue({ _id: assigneeId, isActive: true });

      const currentUser = { _id: ownerId, role: 'user' };

      await taskService.update('task1', { assignedTo: assigneeId }, currentUser);

      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'task_assigned', user: assigneeId })
      );
    });

    it('notifie l’assigné quand la tâche est marquée comme terminée', async () => {
      const task = buildTask({ assignedTo: { toString: () => assigneeId } });
      Task.findById.mockResolvedValue(task);

      const currentUser = { _id: ownerId, role: 'user' };

      await taskService.update('task1', { status: 'done' }, currentUser);

      expect(notificationService.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'task_completed', user: assigneeId })
      );
    });
  });
});
