jest.mock('../../src/services/email.service', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue({ sent: false }),
  isSmtpConfigured: () => false,
}));

const request = require('supertest');
const app = require('../../src/app');
const env = require('../../src/config/env');
const Task = require('../../src/models/Task');
const User = require('../../src/models/User');
const emailService = require('../../src/services/email.service');

const API = env.API_PREFIX;

jest.setTimeout(30000);

const getLastOtp = () => {
  const calls = emailService.sendOtpEmail.mock.calls;
  return calls[calls.length - 1][0].otp;
};

const registerVerifyAndLogin = async (overrides = {}) => {
  const payload = {
    firstName: 'Lamah',
    lastName: 'Foromo',
    email: 'user@example.com',
    password: 'MotDePasseSecurise123!',
    ...overrides,
  };

  await request(app).post(`${API}/auth/register`).send(payload);
  const otp = getLastOtp();
  await request(app).post(`${API}/auth/verify-email`).send({ email: payload.email, otp });

  const res = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: payload.email, password: payload.password });

  return { accessToken: res.body.data.accessToken, user: await User.findOne({ email: payload.email }) };
};

const makeAdmin = async () => {
  const { user } = await registerVerifyAndLogin({ email: 'admin@example.com' });
  await User.updateOne({ _id: user._id }, { $set: { role: 'admin' } });
  const res = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: 'admin@example.com', password: 'MotDePasseSecurise123!' });
  return { accessToken: res.body.data.accessToken, user: await User.findById(user._id) };
};

const createTask = async (accessToken, overrides = {}) => {
  const res = await request(app)
    .post(`${API}/tasks`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ title: 'Rédiger le rapport mensuel', ...overrides });
  return res.body.data.task;
};

describe('Suppression logique (soft delete) des tâches', () => {
  it('crée, supprime logiquement une tâche et vérifie sa persistance en base', async () => {
    const { accessToken, user } = await registerVerifyAndLogin();
    const task = await createTask(accessToken);

    const deleteRes = await request(app)
      .delete(`${API}/tasks/${task.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(deleteRes.body.message).toMatch(/supprimée/i);

    const inDb = await Task.findById(task.id);
    expect(inDb).not.toBeNull();
    expect(inDb.isDeleted).toBe(true);
    expect(inDb.deletedAt).not.toBeNull();
    expect(inDb.deletedBy.toString()).toBe(user._id.toString());
  });

  it("n'affiche plus une tâche supprimée dans la liste normale", async () => {
    const { accessToken } = await registerVerifyAndLogin();
    const task = await createTask(accessToken);
    await createTask(accessToken, { title: 'Autre tâche encore active' });

    await request(app).delete(`${API}/tasks/${task.id}`).set('Authorization', `Bearer ${accessToken}`);

    const listRes = await request(app).get(`${API}/tasks`).set('Authorization', `Bearer ${accessToken}`);
    expect(listRes.statusCode).toBe(200);
    const ids = listRes.body.data.tasks.map((t) => t.id);
    expect(ids).not.toContain(task.id);
    expect(listRes.body.data.tasks).toHaveLength(1);
  });

  it('retourne 404 pour la récupération directe d’une tâche supprimée', async () => {
    const { accessToken } = await registerVerifyAndLogin();
    const task = await createTask(accessToken);
    await request(app).delete(`${API}/tasks/${task.id}`).set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app).get(`${API}/tasks/${task.id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('refuse de supprimer deux fois la même tâche (409)', async () => {
    const { accessToken } = await registerVerifyAndLogin();
    const task = await createTask(accessToken);
    await request(app).delete(`${API}/tasks/${task.id}`).set('Authorization', `Bearer ${accessToken}`);

    const secondDelete = await request(app)
      .delete(`${API}/tasks/${task.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(secondDelete.statusCode).toBe(409);
  });

  it('refuse la suppression sans authentification (401)', async () => {
    const { accessToken } = await registerVerifyAndLogin();
    const task = await createTask(accessToken);

    const res = await request(app).delete(`${API}/tasks/${task.id}`);
    expect(res.statusCode).toBe(401);
  });

  it("refuse la suppression d'une tâche par un autre utilisateur non autorisé (403)", async () => {
    const owner = await registerVerifyAndLogin({ email: 'owner@example.com' });
    const intruder = await registerVerifyAndLogin({ email: 'intruder@example.com' });
    const task = await createTask(owner.accessToken);

    const res = await request(app)
      .delete(`${API}/tasks/${task.id}`)
      .set('Authorization', `Bearer ${intruder.accessToken}`);

    expect(res.statusCode).toBe(403);

    const inDb = await Task.findById(task.id);
    expect(inDb.isDeleted).toBe(false);
  });

  it('permet à un administrateur de supprimer la tâche de n’importe quel utilisateur', async () => {
    const owner = await registerVerifyAndLogin({ email: 'owner2@example.com' });
    const admin = await makeAdmin();
    const task = await createTask(owner.accessToken);

    const res = await request(app)
      .delete(`${API}/tasks/${task.id}`)
      .set('Authorization', `Bearer ${admin.accessToken}`);

    expect(res.statusCode).toBe(200);
    const inDb = await Task.findById(task.id);
    expect(inDb.isDeleted).toBe(true);
    expect(inDb.deletedBy.toString()).toBe(admin.user._id.toString());
  });

  it('retourne 404 pour un id inexistant', async () => {
    const { accessToken } = await registerVerifyAndLogin();
    const res = await request(app)
      .delete(`${API}/tasks/507f1f77bcf86cd799439011`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('retourne 400 pour un id MongoDB invalide (pas de 500)', async () => {
    const { accessToken } = await registerVerifyAndLogin();
    const res = await request(app)
      .delete(`${API}/tasks/id-invalide`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
  });

  it('restaure une tâche supprimée (admin uniquement) et la fait réapparaître dans la liste', async () => {
    const admin = await makeAdmin();
    const task = await createTask(admin.accessToken);
    await request(app).delete(`${API}/tasks/${task.id}`).set('Authorization', `Bearer ${admin.accessToken}`);

    const restoreRes = await request(app)
      .patch(`${API}/tasks/${task.id}/restore`)
      .set('Authorization', `Bearer ${admin.accessToken}`);

    expect(restoreRes.statusCode).toBe(200);

    const inDb = await Task.findById(task.id);
    expect(inDb.isDeleted).toBe(false);
    expect(inDb.deletedAt).toBeNull();
    expect(inDb.deletedBy).toBeNull();

    const listRes = await request(app).get(`${API}/tasks`).set('Authorization', `Bearer ${admin.accessToken}`);
    expect(listRes.body.data.tasks.map((t) => t.id)).toContain(task.id);
  });

  it("n'affecte pas les autres tâches lors d'une suppression", async () => {
    const { accessToken } = await registerVerifyAndLogin();
    const task1 = await createTask(accessToken, { title: 'Tâche à supprimer' });
    const task2 = await createTask(accessToken, { title: 'Tâche à conserver' });

    await request(app).delete(`${API}/tasks/${task1.id}`).set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app).get(`${API}/tasks/${task2.id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.task.id).toBe(task2.id);
  });
});
