jest.mock('../../src/models/Notification');

const Notification = require('../../src/models/Notification');
const notificationService = require('../../src/services/notification.service');

const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439012';
const currentUser = { _id: userId };

describe('notification.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('crée une notification et retourne sa version publique', async () => {
      Notification.create.mockResolvedValue({
        _id: 'notif1',
        user: userId,
        type: 'task_assigned',
        title: 'Nouvelle tâche assignée',
        message: 'Une nouvelle tâche vous a été assignée : Test.',
        relatedTask: 'task1',
        read: false,
        createdAt: new Date(),
      });

      const result = await notificationService.create({
        user: userId,
        type: 'task_assigned',
        title: 'Nouvelle tâche assignée',
        message: 'Une nouvelle tâche vous a été assignée : Test.',
        relatedTask: 'task1',
      });

      expect(Notification.create).toHaveBeenCalledWith({
        user: userId,
        type: 'task_assigned',
        title: 'Nouvelle tâche assignée',
        message: 'Une nouvelle tâche vous a été assignée : Test.',
        relatedTask: 'task1',
      });
      expect(result.id).toBe('notif1');
      expect(result.read).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    it('compte les notifications non lues de l’utilisateur courant', async () => {
      Notification.countDocuments.mockResolvedValue(3);

      const count = await notificationService.getUnreadCount(currentUser);

      expect(Notification.countDocuments).toHaveBeenCalledWith({ user: userId, read: false });
      expect(count).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('refuse de marquer comme lue une notification qui appartient à un autre utilisateur', async () => {
      Notification.findById.mockResolvedValue({ _id: 'notif1', user: otherUserId });

      await expect(notificationService.markAsRead('notif1', currentUser)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('marque la notification comme lue quand elle appartient à l’utilisateur courant', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      Notification.findById.mockResolvedValue({ _id: 'notif1', user: userId, read: false, save });

      const result = await notificationService.markAsRead('notif1', currentUser);

      expect(save).toHaveBeenCalled();
      expect(result.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('marque toutes les notifications non lues de l’utilisateur comme lues', async () => {
      Notification.updateMany.mockResolvedValue({ modifiedCount: 2 });

      await notificationService.markAllAsRead(currentUser);

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { user: userId, read: false },
        { $set: { read: true } }
      );
    });
  });

  describe('remove', () => {
    it('lève une erreur 404 si la notification n’appartient pas à l’utilisateur', async () => {
      Notification.findById.mockResolvedValue({ _id: 'notif1', user: otherUserId });

      await expect(notificationService.remove('notif1', currentUser)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('supprime la notification quand elle appartient à l’utilisateur courant', async () => {
      const deleteOne = jest.fn().mockResolvedValue(undefined);
      Notification.findById.mockResolvedValue({ _id: 'notif1', user: userId, deleteOne });

      await notificationService.remove('notif1', currentUser);

      expect(deleteOne).toHaveBeenCalled();
    });
  });
});
