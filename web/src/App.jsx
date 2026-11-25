import { NavLink, Route, Routes } from 'react-router-dom';
import TasksPage from './pages/TasksPage.jsx';
import TaskDetailPage from './pages/TaskDetailPage.jsx';
import TeamsPage from './pages/TeamsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <div className="layout">
      <header className="header">
        <span className="brand">✓ TaskFlow</span>
        <nav>
          <NavLink to="/" end>Tareas</NavLink>
          <NavLink to="/teams">Equipos</NavLink>
          <NavLink to="/about">Acerca de</NavLink>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
