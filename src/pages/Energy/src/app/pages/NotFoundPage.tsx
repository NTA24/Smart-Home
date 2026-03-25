import { Link, useLocation } from "react-router";

export function NotFoundPage() {
  const location = useLocation();
  return (
    <section style={{ padding: 16 }}>
      <h2>404</h2>
      <p>
        Không có route: <code>{location.pathname}</code>
      </p>
      <Link to="/home">Về Home</Link>
    </section>
  );
}
