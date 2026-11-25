import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, STATUSES, statusLabel } from '../api.js';

const EMPTY_FORM = { title: '', description: '', team: '', priority: 3, dueDate: '' };

export default function TasksPage() {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ team: '', status: '', page: 1 });
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const body = await api.listTasks({ ...filters, sort: '-priority,createdAt', limit: 10 });
      setTasks(body.data);
      setPagination(body.pagination);
      setError('');
    } catch (err) {
      setError(`No se pudo cargar la lista: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    api
      .listTeams()
      .then((data) => {
        setTeams(data);
        if (data.length) setForm((f) => ({ ...f, team: f.team || data[0]._id }));
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setFilter = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value, page: 1 }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTask({
        title: form.title,
        description: form.description,
        team: form.team,
        priority: Number(form.priority),
        dueDate: form.dueDate || null,
      });
      setForm((f) => ({ ...EMPTY_FORM, team: f.team }));
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const changeStatus = async (task, status) => {
    try {
      const updated = await api.updateTask(task._id, { status });
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteTask(id);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h1>Tareas</h1>

      {teams.length === 0 ? (
        <p className="card">
          Para crear tareas primero necesitas un equipo. <Link to="/teams">Crear un equipo →</Link>
        </p>
      ) : (
        <form className="card form" onSubmit={handleSubmit}>
          <input
            placeholder="Título de la tarea (mínimo 3 caracteres)"
            value={form.title}
            onChange={setField('title')}
            minLength={3}
            maxLength={120}
            required
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={form.description}
            onChange={setField('description')}
            maxLength={500}
            rows={2}
          />
          <div className="row">
            <label>
              Equipo
              <select value={form.team} onChange={setField('team')} required>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </label>
            <label>
              Prioridad
              <select value={form.priority} onChange={setField('priority')}>
                {[1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
            <label>
              Fecha límite
              <input type="date" value={form.dueDate} onChange={setField('dueDate')} />
            </label>
          </div>
          <button type="submit">Añadir tarea</button>
        </form>
      )}

      <div className="filters">
        <select value={filters.team} onChange={setFilter('team')} aria-label="Filtrar por equipo">
          <option value="">Todos los equipos</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <select value={filters.status} onChange={setFilter('status')} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="muted">Cargando…</p>
      ) : tasks.length === 0 ? (
        <p className="muted">No hay tareas con estos filtros.</p>
      ) : (
        <ul className="list">
          {tasks.map((task) => (
            <li key={task._id} className={`card task ${task.status === 'done' ? 'done' : ''}`}>
              <span className={`prio prio-${task.priority}`} title="Prioridad">{task.priority}</span>
              <div className="task-body">
                <Link to={`/tasks/${task._id}`} className="task-title">{task.title}</Link>
                <span className="muted small">
                  {task.team?.name}
                  {task.dueDate && ` · vence ${new Date(task.dueDate).toLocaleDateString('es', { timeZone: 'UTC' })}`}
                </span>
              </div>
              <select
                value={task.status}
                onChange={(e) => changeStatus(task, e.target.value)}
                aria-label="Estado"
                className={`status status-${task.status}`}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{statusLabel(s.value)}</option>
                ))}
              </select>
              <button className="ghost" onClick={() => remove(task._id)} aria-label="Eliminar">✕</button>
            </li>
          ))}
        </ul>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pager">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          >
            ← Anterior
          </button>
          <span className="muted">Página {pagination.page} de {pagination.totalPages}</span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          >
            Siguiente →
          </button>
        </div>
      )}
    </section>
  );
}
