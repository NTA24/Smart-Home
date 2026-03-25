import type { DashboardSettings } from "../../../../../shared/models/dashboard.models";

interface Props {
  settings: DashboardSettings;
  onSave: (next: DashboardSettings) => void;
  onCancel: () => void;
}

export function DashboardSettingsForm({ settings, onSave, onCancel }: Props) {
  const s = { ...settings };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSave({
          titleColor: String(fd.get("titleColor") ?? ""),
          showTitle: fd.get("showTitle") === "on",
          showDashboardExport: fd.get("showDashboardExport") === "on",
          showUpdateDashboardImage: fd.get("showUpdateDashboardImage") === "on",
          showDashboardTimewindow: fd.get("showDashboardTimewindow") === "on",
          showDashboardsSelect: fd.get("showDashboardsSelect") === "on",
          showEntitiesSelect: fd.get("showEntitiesSelect") === "on",
          showFilters: fd.get("showFilters") === "on",
          toolbarAlwaysOpen: fd.get("toolbarAlwaysOpen") === "on",
          hideToolbar: fd.get("hideToolbar") === "on",
          stateControllerId: String(fd.get("stateControllerId") ?? ""),
        });
      }}
      style={{ display: "grid", gap: 10 }}
    >
      <label>
        Title color
        <input name="titleColor" type="text" defaultValue={s.titleColor ?? "#333"} style={{ width: "100%" }} />
      </label>
      <label>
        State controller id
        <input name="stateControllerId" type="text" defaultValue={s.stateControllerId ?? "default"} style={{ width: "100%" }} />
      </label>
      {(
        [
          ["showTitle", "Show title"],
          ["showDashboardExport", "Show export"],
          ["showUpdateDashboardImage", "Show update image"],
          ["showDashboardTimewindow", "Show timewindow"],
          ["showDashboardsSelect", "Show dashboard select"],
          ["showEntitiesSelect", "Show entities select"],
          ["showFilters", "Show filters"],
          ["toolbarAlwaysOpen", "Toolbar always open"],
          ["hideToolbar", "Hide toolbar"],
        ] as const
      ).map(([name, label]) => (
        <label key={name} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input name={name} type="checkbox" defaultChecked={s[name] !== false} />
          {label}
        </label>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
