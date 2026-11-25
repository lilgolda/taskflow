// Pruebas de la app de Express sin base de datos:
// solo se prueban rutas que responden antes de consultar MongoDB.
const request = require('supertest');
const app = require('../app');

describe('TaskFlow API', () => {
  test('GET / responde que la API está funcionando', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.endpoints).toEqual(['/api/users', '/api/teams', '/api/tasks']);
  });

  test('una ruta inexistente responde 404 con el formato de error común', async () => {
    const res = await request(app).get('/api/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, status: 404 });
  });

  test('un id mal formado responde 400 sin llegar a la base de datos', async () => {
    const res = await request(app).get('/api/tasks/123');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("'123'");
  });

  test('un estado no válido en el filtro responde 400', async () => {
    const res = await request(app).get('/api/tasks?status=terminada');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('terminada');
  });

  test('un JSON mal escrito en el body responde 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{"title": ');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('El cuerpo de la petición no es un JSON válido');
  });
});
