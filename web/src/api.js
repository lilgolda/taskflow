// VITE_API_URL se inyecta en tiempo de build (ARG en el Dockerfile).
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

// La API responde { success, data, ... } o, si falla, { success: false, message, errors? }.
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const details = (body.errors || []).map((e) => e.message).join(' · ');
    throw new Error(details || body.message || `Error ${res.status}`);
  }
  return body;
}

const toQuery = (params) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
  const s = qs.toString();
  return s ? `?${s}` : '';
};

export const STATUSES = [
  { value: 'todo', label: 'Por hacer' },
  { value: 'in-progress', label: 'En progreso' },
  { value: 'done', label: 'Hecha' },
];

export const statusLabel = (value) => STATUSES.find((s) => s.value === value)?.label || value;

export const api = {
  // Tareas
  listTasks: (params = {}) => request(`/tasks${toQuery(params)}`),
  getTask: (id) => request(`/tasks/${id}`).then((b) => b.data),
  createTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }).then((b) => b.data),
  updateTask: (id, changes) =>
    request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) }).then((b) => b.data),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Equipos
  listTeams: () => request('/teams').then((b) => b.data),
  createTeam: (team) => request('/teams', { method: 'POST', body: JSON.stringify(team) }).then((b) => b.data),
  deleteTeam: (id) => request(`/teams/${id}`, { method: 'DELETE' }),
  teamStats: (id) => request(`/teams/${id}/task-stats`).then((b) => b.data),
};
