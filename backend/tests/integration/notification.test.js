jest.mock('../../src/services/email.service', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue({ sent: false }),
  isSmtpConfigured: () => false,
}));

const request = require('supertest');
const app = require('../../src/app');
const env = require('../../src/config/env');
const emailService = require('../../src/services/email.service');

const API = env.API_PREFIX;

jest.setTimeout(30000);

const getLastOtp = () => {
  const calls = emailService.sendOtpEmail.mock.calls;
  return calls[calls.length - 1][0].otp;
};

const registerVerifyAndLogin = async (overrides = {}) => {
  const payload = {
    firstName: 'Camara',
    lastName: 'Fatoumata',
    email: 'notif-user@example.com',
    password: 'MotDePasseSecurise123!',
    ...overrides,
  };

  await request(app).post(`${API}/auth/register`).send(payload);
  const otp = getLastOtp();
  await request(app).post(`${API}/auth/verify-email`).send({ email: payload.email, otp });

  const res = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: payload.email, password: payload.password });

  return { accessToken: res.body.data.accessToken, userId: res.body.data.user.id };
};

describe('Notifications', () => {
  it('notifie l’utilisateur assigné lors de la création d’une tâche par un autre utilisateur', async () => {
    const creator = await registerVerifyAndLogin({ email: 'notif-creator@example.com' });
    const assignee = await registerVerifyAndLogin({ email: 'notif-assignee@example.com' });

    const taskRes = await request(app)
      .post(`${API}/tasks`)
      .set('Authorization', `Bearer ${creator.accessToken}`)
      .send({ title: 'Préparer le budget', assignedTo: assignee.userId });

    expect(taskRes.status).toBe(201);

    const listRes = await request(app)
      .get(`${API}/notifications`)
      .set('Authorization', `Bearer ${assignee.accessToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.notifications).toHaveLength(1);
    expect(listRes.body.data.notifications[0]).toMatchObject({
      type: 'task_assigned',
      read: false,
    });
  });

  it('ne crée aucune notification quand on s’assigne soi-même une tâche', async () => {
    const user = await registerVerifyAndLogin({ email: 'notif-self@example.com' });

    await request(app)
      .post(`${API}/tasks`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send({ title: 'Tâche personnelle', assignedTo: user.userId });

    const listRes = await request(app)
      .get(`${API}/notifications`)
      .set('Authorization', `Bearer ${user.accessToken}`);

    expect(listRes.body.data.notifications).toHaveLength(0);
  });

  it('marque une notification comme lue puis toutes comme lues', async () => {
    const creator = await registerVerifyAndLogin({ email: 'notif-creator-2@example.com' });
    const assignee = await registerVerifyAndLogin({ email: 'notif-assignee-2@example.com' });

    await request(app)
      .post(`${API}/tasks`)
      .set('Authorization', `Bearer ${creator.accessToken}`)
      .send({ title: 'Tâche A', assignedTo: assignee.userId });
    await request(app)
      .post(`${API}/tasks`)
      .set('Authorization', `Bearer ${creator.accessToken}`)
      .send({ title: 'Tâche B', assignedTo: assignee.userId });

    const before = await request(app)
      .get(`${API}/notifications/unread-count`)
      .set('Authorization', `Bearer ${assignee.accessToken}`);
    expect(before.body.data.count).toBe(2);

    const list = await request(app)
      .get(`${API}/notifications`)
      .set('Authorization', `Bearer ${assignee.accessToken}`);
    const firstId = list.body.data.notifications[0].id;

    const readRes = await request(app)
      .patch(`${API}/notifications/${firstId}/read`)
      .set('Authorization', `Bearer ${assignee.accessToken}`);
    expect(readRes.status).toBe(200);
    expect(readRes.body.data.notification.read).toBe(true);

    await request(app)
      .patch(`${API}/notifications/read-all`)
      .set('Authorization', `Bearer ${assignee.accessToken}`);

    const after = await request(app)
      .get(`${API}/notifications/unread-count`)
      .set('Authorization', `Bearer ${assignee.accessToken}`);
    expect(after.body.data.count).toBe(0);
  });

  it("refuse d'accéder à la notification d'un autre utilisateur", async () => {
    const creator = await registerVerifyAndLogin({ email: 'notif-creator-3@example.com' });
    const assignee = await registerVerifyAndLogin({ email: 'notif-assignee-3@example.com' });
    const intruder = await registerVerifyAndLogin({ email: 'notif-intruder@example.com' });

    await request(app)
      .post(`${API}/tasks`)
      .set('Authorization', `Bearer ${creator.accessToken}`)
      .send({ title: 'Tâche confidentielle', assignedTo: assignee.userId });

    const list = await request(app)
      .get(`${API}/notifications`)
      .set('Authorization', `Bearer ${assignee.accessToken}`);
    const notificationId = list.body.data.notifications[0].id;

    const res = await request(app)
      .delete(`${API}/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${intruder.accessToken}`);

    expect(res.status).toBe(404);
  });
});
