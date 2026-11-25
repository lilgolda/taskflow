const pick = require('../utils/pick');
const AppError = require('../utils/AppError');
const { getStringQuery, getObjectIdQuery, getPositiveIntQuery } = require('../utils/query');

describe('pick', () => {
  test('devuelve solo los campos permitidos', () => {
    const body = { title: 'Tarea', completedAt: '2026-01-01', hack: true };
    expect(pick(body, ['title', 'description'])).toEqual({ title: 'Tarea' });
  });

  test('no falla si el body no es un objeto', () => {
    expect(pick(undefined, ['title'])).toEqual({});
  });
});

describe('query helpers', () => {
  test('getStringQuery recorta espacios e ignora valores vacíos', () => {
    expect(getStringQuery({ search: '  api ' }, 'search')).toBe('api');
    expect(getStringQuery({ search: '' }, 'search')).toBeUndefined();
  });

  test('getStringQuery rechaza parámetros repetidos (arrays)', () => {
    expect(() => getStringQuery({ status: ['a', 'b'] }, 'status')).toThrow(AppError);
  });

  test('getObjectIdQuery valida el formato de id de MongoDB', () => {
    const id = '65f1a2b3c4d5e6f7a8b9c0d1';
    expect(getObjectIdQuery({ team: id }, 'team')).toBe(id);
    expect(() => getObjectIdQuery({ team: 'abc' }, 'team')).toThrow("no es un id válido");
  });

  test('getPositiveIntQuery usa el valor por defecto y respeta el máximo', () => {
    expect(getPositiveIntQuery({}, 'page', 1)).toBe(1);
    expect(getPositiveIntQuery({ limit: '500' }, 'limit', 10, 100)).toBe(100);
    expect(() => getPositiveIntQuery({ page: '0' }, 'page', 1)).toThrow(AppError);
  });
});
