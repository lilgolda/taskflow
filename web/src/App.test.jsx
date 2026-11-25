import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </MemoryRouter>
  );

describe('App', () => {
  test('muestra la navegación principal', () => {
    renderAt('/about');

    expect(screen.getByRole('link', { name: 'Tareas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Equipos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Acerca de TaskFlow' })).toBeInTheDocument();
  });

  test('una ruta desconocida muestra la página 404', () => {
    renderAt('/ruta-que-no-existe');

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
  });
});
