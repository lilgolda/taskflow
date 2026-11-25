import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, STATUSES, statusLabel } from '../api.js';

const formatDate = (value, opts) => (value ? new Date(value).toLocaleString('es', opts) : '—');

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTask(id).then(setTask).catch((err) => setError(err.message));
  }, [id]);

  if (error && !task) {
    return (
      <p className="error">
        {error} · <Link to="/">Volver</Link>
      </p>
    );
  }
  if (!task) return <p className="muted">Cargando…</p>;

  const changeStatus = async (status) => {
    try {
      setTask(await api.updateTask(task._id, { status }));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async () => {
    try {
      await api.deleteTask(task._id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="card detail">
      <Link to="/">← Volver</Link>
      <h1>{task.title}</h1>
      <p>{task.description || <span className="muted">Sin descripción</span>}</p>
      <dl className="meta">
        <dt>Equipo</dt>
        <dd>{task.team?.name || '—'}</dd>
        <dt>Asignada a</dt>
        <dd>{task.assignedTo ? `${task.assignedTo.name} (${task.assignedTo.email})` : 'Sin asignar'}</dd>
        <dt>Prioridad</dt>
        <dd>{task.priority} / 5</dd>
        <dt>Estado</dt>
        <dd>{statusLabel(task.status)}</dd>
        <dt>Fecha límite</dt>
        <dd>{formatDate(task.dueDate, { dateStyle: 'medium', timeZone: 'UTC' })}</dd>
        <dt>Completada</dt>
        <dd>{formatDate(task.completedAt)}</dd>
        <dt>Creada</dt>
        <dd>{formatDate(task.createdAt)}</dd>
      </dl>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        {STATUSES.filter((s) => s.value !== task.status).map((s) => (
          <button key={s.value} onClick={() => changeStatus(s.value)}>
            Pasar a «{s.label}»
          </button>
        ))}
        <button className="danger" onClick={remove}>Eliminar</button>
      </div>
    </section>
  );
}
