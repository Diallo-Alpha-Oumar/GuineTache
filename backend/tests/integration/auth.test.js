jest.mock('../../src/services/email.service', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue({ sent: false }),
  isSmtpConfigured: () => false,
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const env = require('../../src/config/env');
const User = require('../../src/models/User');
const Verification = require('../../src/models/Verification');
const emailService = require('../../src/services/email.service');

const API = env.API_PREFIX;

const validUser = {
  firstName: 'Lamah',
  lastName: 'Foromo',
  email: 'lamah@example.com',
  password: 'MotDePasseSecurise123!',
};

const getLastOtp = () => {
  const calls = emailService.sendOtpEmail.mock.calls;
  return calls[calls.length - 1][0].otp;
};

const registerAndGetOtp = async (overrides = {}) => {
  const payload = { ...validUser, ...overrides };
  await request(app).post(`${API}/auth/register`).send(payload);
  return getLastOtp();
};

const registerVerifyAndLogin = async () => {
  const otp = await registerAndGetOtp();
  await request(app).post(`${API}/auth/verify-email`).send({ email: validUser.email, otp });
  const res = await request(app)
    .post(`${API}/auth/login`)
    .send({ email: validUser.email, password: validUser.password });
  return res;
};

describe('POST /auth/register', () => {
  it('inscrit un utilisateur valide et hash son mot de passe', async () => {
    const res = await request(app).post(`${API}/auth/register`).send(validUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const created = await User.findOne({ email: validUser.email }).select('+password');
    expect(created).not.toBeNull();
    expect(created.password).not.toBe(validUser.password);
    expect(created.role).toBe('user');
    expect(created.isEmailVerified).toBe(false);
  });

  it('refuse un e-mail déjà utilisé', async () => {
    await request(app).post(`${API}/auth/register`).send(validUser);
    const res = await request(app).post(`${API}/auth/register`).send(validUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('refuse un e-mail invalide', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ ...validUser, email: 'pas-un-email' });

    expect(res.statusCode).toBe(400);
  });

  it('refuse un mot de passe ne respectant pas la politique de sécurité', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ ...validUser, password: 'faible' });

    expect(res.statusCode).toBe(400);
  });

  it("empêche l'auto-attribution du rôle admin", async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ ...validUser, role: 'admin' });

    expect(res.statusCode).toBe(400);

    const created = await User.findOne({ email: validUser.email });
    expect(created).toBeNull();
  });
});

describe('POST /auth/verify-email', () => {
  it('vérifie un OTP valide', async () => {
    const otp = await registerAndGetOtp();
    const res = await request(app)
      .post(`${API}/auth/verify-email`)
      .send({ email: validUser.email, otp });

    expect(res.statusCode).toBe(200);
    const user = await User.findOne({ email: validUser.email });
    expect(user.isEmailVerified).toBe(true);
  });

  it('refuse un OTP incorrect', async () => {
    await registerAndGetOtp();
    const res = await request(app)
      .post(`${API}/auth/verify-email`)
      .send({ email: validUser.email, otp: '000000' });

    expect(res.statusCode).toBe(400);
  });

  it('refuse un OTP expiré', async () => {
    const otp = await registerAndGetOtp();
    await Verification.updateMany({}, { $set: { expiresAt: new Date(Date.now() - 1000) } });

    const res = await request(app)
      .post(`${API}/auth/verify-email`)
      .send({ email: validUser.email, otp });

    expect(res.statusCode).toBe(400);
  });

  it('refuse un OTP déjà utilisé', async () => {
    const otp = await registerAndGetOtp();
    await request(app).post(`${API}/auth/verify-email`).send({ email: validUser.email, otp });

    const res = await request(app)
      .post(`${API}/auth/verify-email`)
      .send({ email: validUser.email, otp });

    expect(res.statusCode).toBe(400);
  });
});

describe('POST /auth/resend-otp', () => {
  it('renvoie un nouveau code OTP après le délai anti-abus', async () => {
    await registerAndGetOtp();
    // Simule l'écoulement du délai anti-abus entre deux demandes d'OTP.
    await Verification.updateMany(
      {},
      { $set: { createdAt: new Date(Date.now() - env.OTP_RESEND_COOLDOWN_SECONDS * 1000 - 1000) } }
    );

    const res = await request(app).post(`${API}/auth/resend-otp`).send({ email: validUser.email });

    expect(res.statusCode).toBe(200);
    expect(emailService.sendOtpEmail).toHaveBeenCalledTimes(2);
  });

  it('refuse un renvoi trop rapproché (protection anti-abus)', async () => {
    await registerAndGetOtp();
    const res = await request(app).post(`${API}/auth/resend-otp`).send({ email: validUser.email });

    expect(res.statusCode).toBe(429);
  });
});

describe('POST /auth/login', () => {
  it('connecte un utilisateur vérifié avec les bons identifiants', async () => {
    const res = await registerVerifyAndLogin();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);
  });

  it('refuse un mauvais mot de passe', async () => {
    const otp = await registerAndGetOtp();
    await request(app).post(`${API}/auth/verify-email`).send({ email: validUser.email, otp });

    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: validUser.email, password: 'MauvaisMotDePasse123!' });

    expect(res.statusCode).toBe(401);
  });

  it('refuse un utilisateur inexistant', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: 'inconnu@example.com', password: 'MotDePasseSecurise123!' });

    expect(res.statusCode).toBe(401);
  });

  it('refuse un utilisateur non vérifié', async () => {
    await registerAndGetOtp();

    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(403);
  });

  it('refuse un utilisateur désactivé', async () => {
    const otp = await registerAndGetOtp();
    await request(app).post(`${API}/auth/verify-email`).send({ email: validUser.email, otp });
    await User.updateOne({ email: validUser.email }, { $set: { isActive: false } });

    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: validUser.email, password: validUser.password });

    expect(res.statusCode).toBe(403);
  });
});

describe('GET /auth/me', () => {
  it('retourne l’utilisateur courant avec un token valide', async () => {
    const loginRes = await registerVerifyAndLogin();
    const { accessToken } = loginRes.body.data;

    const res = await request(app).get(`${API}/auth/me`).set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(validUser.email);
    expect(res.body.data.password).toBeUndefined();
  });

  it('refuse une requête sans token', async () => {
    const res = await request(app).get(`${API}/auth/me`);
    expect(res.statusCode).toBe(401);
  });

  it('refuse un token invalide', async () => {
    const res = await request(app).get(`${API}/auth/me`).set('Authorization', 'Bearer token.invalide');
    expect(res.statusCode).toBe(401);
  });

  it('refuse un token expiré', async () => {
    const expiredToken = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, env.JWT_SECRET, {
      expiresIn: '-10s',
    });

    const res = await request(app)
      .get(`${API}/auth/me`)
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.statusCode).toBe(401);
  });
});

describe('POST /auth/refresh-token et /auth/logout', () => {
  it('génère un nouvel access token à partir du refresh token', async () => {
    const loginRes = await registerVerifyAndLogin();
    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app).post(`${API}/auth/refresh-token`).set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('révoque la session lors de la déconnexion', async () => {
    const loginRes = await registerVerifyAndLogin();
    const cookie = loginRes.headers['set-cookie'];

    const logoutRes = await request(app).post(`${API}/auth/logout`).set('Cookie', cookie);
    expect(logoutRes.statusCode).toBe(200);

    const refreshRes = await request(app).post(`${API}/auth/refresh-token`).set('Cookie', cookie);
    expect(refreshRes.statusCode).toBe(401);
  });
});

describe('Mot de passe oublié / réinitialisation / changement', () => {
  it('forgot-password répond toujours de façon générique', async () => {
    await registerVerifyAndLogin();

    const resKnown = await request(app)
      .post(`${API}/auth/forgot-password`)
      .send({ email: validUser.email });
    const resUnknown = await request(app)
      .post(`${API}/auth/forgot-password`)
      .send({ email: 'inconnu@example.com' });

    expect(resKnown.statusCode).toBe(200);
    expect(resUnknown.statusCode).toBe(200);
    expect(resKnown.body.message).toBe(resUnknown.body.message);
  });

  it('réinitialise le mot de passe avec un OTP valide', async () => {
    await registerVerifyAndLogin();
    await request(app).post(`${API}/auth/forgot-password`).send({ email: validUser.email });
    const otp = getLastOtp();

    const res = await request(app).post(`${API}/auth/reset-password`).send({
      email: validUser.email,
      otp,
      newPassword: 'NouveauMotDePasse456!',
    });

    expect(res.statusCode).toBe(200);

    const loginRes = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: validUser.email, password: 'NouveauMotDePasse456!' });
    expect(loginRes.statusCode).toBe(200);
  });

  it('refuse la réinitialisation avec un OTP incorrect', async () => {
    await registerVerifyAndLogin();
    await request(app).post(`${API}/auth/forgot-password`).send({ email: validUser.email });

    const res = await request(app).post(`${API}/auth/reset-password`).send({
      email: validUser.email,
      otp: '000000',
      newPassword: 'NouveauMotDePasse456!',
    });

    expect(res.statusCode).toBe(400);
  });

  it('change le mot de passe après vérification de l’ancien', async () => {
    const loginRes = await registerVerifyAndLogin();
    const { accessToken } = loginRes.body.data;

    const res = await request(app)
      .patch(`${API}/auth/change-password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: validUser.password, newPassword: 'NouveauMotDePasse456!' });

    expect(res.statusCode).toBe(200);

    const badRes = await request(app)
      .patch(`${API}/auth/change-password`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'MauvaisAncien123!', newPassword: 'Autre789!' });

    expect(badRes.statusCode).toBe(400);
  });
});
