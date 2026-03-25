import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { dashboardService } from "../../../../core/http/dashboardService";
import type { Dashboard } from "../../../../shared/models/dashboard.models";

export function DashboardPage() {
  const { dashboardId = "" } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await dashboardService.getDashboard(dashboardId);
        if (!disposed) {
          setDashboard(result);
          setTitle(result.title);
        }
      } catch (e) {
        if (!disposed) {
          setError(e instanceof Error ? e.message : "Unable to load dashboard");
        }
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    }
    if (dashboardId) {
      void load();
    }
    return () => {
      disposed = true;
    };
  }, [dashboardId]);

  const canSave = useMemo(() => Boolean(dashboard && title.trim().length > 0 && title !== dashboard.title), [dashboard, title]);

  async function save() {
    if (!dashboard || !canSave) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await dashboardService.saveDashboard({ ...dashboard, title: title.trim() });
      setDashboard(saved);
      setTitle(saved.title);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2>Dashboard Page</h2>
        <button onClick={() => navigate("/dashboards")}>Back to dashboards</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {!!dashboard && (
        <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
          <label>
            Dashboard title
            <input
              style={{ width: "100%", marginTop: 6 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={!canSave || saving} onClick={() => void save()}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <div style={{ background: "#f7f7f8", padding: 12 }}>
            <strong>Placeholder for dashboard widgets/layout/toolbar</strong>
            <p style={{ marginBottom: 0 }}>
              This React page maps Angular `DashboardPageComponent` responsibilities: load dashboard by id,
              edit metadata, and host the dashboard rendering surface.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
