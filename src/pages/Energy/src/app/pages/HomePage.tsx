import { Link } from "react-router";

export function HomePage() {
  return (
    <section style={{ padding: 16 }}>
      <h2>Home</h2>
      <p>Ứng dụng React migration — chọn mục trong sidebar hoặc các liên kết nhanh:</p>
      <ul>
        <li>
          <Link to="/dashboards">Dashboards</Link>
        </li>
        <li>
          <Link to="/entities/devices">Devices</Link>
        </li>
        <li>
          <Link to="/entities/assets">Assets</Link>
        </li>
        <li>
          <Link to="/entities/entityViews">Entity views</Link>
        </li>
      </ul>
    </section>
  );
}
