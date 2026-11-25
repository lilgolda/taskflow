import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="card">
      <h1>404</h1>
      <p>
        Esta página no existe. <Link to="/">Ir a las tareas</Link>
      </p>
    </section>
  );
}
