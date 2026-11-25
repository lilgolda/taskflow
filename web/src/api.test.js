import { afterEach, describe, expect, test, vi } from 'vitest';
import { api, statusLabel } from './api.js';

const mockFetch = (status, body) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('statusLabel', () => {
  test('traduce los estados de la API', () => {
    expect(statusLabel('todo')).toBe('Por hacer');
    expect(statusLabel('in-progress')).toBe('En progreso');
    expect(statusLabel('done')).toBe('Hecha');
  });
});

describe('cliente de la API', () => {
  test('listTeams devuelve el contenido de "data"', async () => {
    mockFetch(200, { success: true, data: [{ _id: '1', name: 'DevOps' }] });

    await expect(api.listTeams()).resolves.toEqual([{ _id: '1', name: 'DevOps' }]);
  });

  test('listTasks envía solo los filtros con valor', async () => {
    const fetchSpy = mockFetch(200, { success: true, data: [], pagination: {} });

    await api.listTasks({ team: '', status: 'done', page: 2 });

    expect(fetchSpy.mock.calls[0][0]).toMatch(/\/tasks\?status=done&page=2$/);
  });

  test('un error de validación muestra los mensajes de la API', async () => {
    mockFetch(400, {
      success: false,
      message: 'Error de validación',
      errors: [{ field: 'title', message: 'El título debe tener al menos 3 caracteres' }],
    });

    await expect(api.createTask({ title: 'a' })).rejects.toThrow(
      'El título debe tener al menos 3 caracteres'
    );
  });
});
