export default function AboutPage() {
  return (
    <section className="card">
      <h1>Acerca de TaskFlow</h1>
      <p>Gestor de tareas por equipos con React, Node.js (Express) y MongoDB, contenerizado con Docker Compose.</p>
      <p className="muted">
        Recarga esta página (F5): si sigue viéndose, Nginx está sirviendo bien las rutas de React Router.
      </p>
    </section>
  );
}
