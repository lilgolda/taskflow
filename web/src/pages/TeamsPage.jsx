import { useEffect, useState } from 'react';
import { api, STATUSES } from '../api.js';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({});
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await api.listTeams();
      setTeams(data);
      // Estadísticas de cada equipo (endpoint con Aggregation Pipeline)
      const entries = await Promise.all(data.map(async (t) => [t._id, await api.teamStats(t._id)]));
      setStats(Object.fromEntries(entries));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTeam({ name, description });
      setName('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (team) => {
    if (!window.confirm(`¿Eliminar el equipo «${team.name}»? También se eliminarán sus tareas.`)) return;
    try {
      await api.deleteTeam(team._id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h1>Equipos</h1>
      <form className="card form" onSubmit={handleSubmit}>
        <input
          placeholder="Nombre del equipo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={60}
          required
        />
        <input
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
        />
        <button type="submit">Crear equipo</button>
      </form>

      {error && <p className="error">{error}</p>}

      {teams.length === 0 ? (
        <p className="muted">Todavía no hay equipos.</p>
      ) : (
        <ul className="list">
          {teams.map((team) => (
            <li key={team._id} className="card team">
              <div className="task-body">
                <strong>{team.name}</strong>
                {team.description && <span className="muted small">{team.description}</span>}
                {stats[team._id] && (
                  <span className="small">
                    {stats[team._id].total} tarea(s):{' '}
                    {STATUSES.map((s) => `${s.label} ${stats[team._id].byStatus[s.value]}`).join(' · ')}
                  </span>
                )}
              </div>
              <button className="ghost" onClick={() => remove(team)} aria-label="Eliminar equipo">✕</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
