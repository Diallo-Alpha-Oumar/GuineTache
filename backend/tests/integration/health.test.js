const request = require('supertest');
const app = require('../../src/app');
const env = require('../../src/config/env');

describe('GET /api/v1/health', () => {
  it("retourne un statut 200 et confirme que l'API est opérationnelle", async () => {
    const res = await request(app).get(`${env.API_PREFIX}/health`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('API opérationnelle');
  });
});

describe('GET /api/v1/route-inexistante', () => {
  it('retourne un statut 404 pour une route inconnue', async () => {
    const res = await request(app).get(`${env.API_PREFIX}/route-inexistante`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
