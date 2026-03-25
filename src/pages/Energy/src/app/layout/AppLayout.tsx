import type { CSSProperties } from "react";
import { NavLink, Outlet } from "react-router";

const navLinkStyle = ({ isActive }: { isActive: boolean }): CSSProperties => ({
  display: "block",
  padding: "6px 10px",
  borderRadius: 6,
  textDecoration: "none",
  color: isActive ? "#fff" : "#1a1a1a",
  background: isActive ? "#1976d2" : "transparent",
});

export function AppLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          borderRight: "1px solid #e0e0e0",
          padding: 12,
          background: "#fff",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 12 }}>ThingsBoard (React)</div>
        <nav style={{ display: "grid", gap: 4 }}>
          <NavLink to="/home" style={navLinkStyle} end>
            Home
          </NavLink>
          <NavLink to="/dashboards" style={navLinkStyle}>
            Dashboards
          </NavLink>
          <NavLink to="/entities/devices" style={navLinkStyle}>
            Devices
          </NavLink>
          <NavLink to="/entities/assets" style={navLinkStyle}>
            Assets
          </NavLink>
          <NavLink to="/entities/entityViews" style={navLinkStyle}>
            Entity views
          </NavLink>
          <NavLink to="/customers" style={navLinkStyle}>
            Customers
          </NavLink>
          <NavLink to="/ruleChains" style={navLinkStyle}>
            Rule chains
          </NavLink>
          <NavLink to="/settings" style={navLinkStyle}>
            Settings
          </NavLink>
        </nav>
      </aside>
      <main style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
