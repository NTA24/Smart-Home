import type { ReactNode } from "react";
import type { Dashboard } from "../../../../shared/models/dashboard.models";

export interface DashboardToolbarFlags {
  widgetEditMode: boolean;
  hideToolbar: boolean;
  toolbarOpened: boolean;
  isFullscreen: boolean;
  isMobileApp: boolean;
  currentDashboardId: string;
  readonly: boolean;
  isTenantAdmin: boolean;
  isEdit: boolean;
  isLoading: boolean;
  showCloseToolbar: boolean;
  hideFullscreenButton: boolean;
  displayExport: boolean;
  displayUpdateDashboardImage: boolean;
  displayDashboardTimewindow: boolean;
  displayDashboardsSelect: boolean;
  displayEntitiesSelect: boolean;
  displayFilters: boolean;
  showRightLayoutSwitch: boolean;
  isRightLayoutOpened: boolean;
}

export interface DashboardToolbarHandlers {
  openToolbar: () => void;
  closeToolbar: () => void;
  toggleLayouts: () => void;
  setFullscreen: (v: boolean) => void;
  exportDashboard: () => void;
  toggleEditMode: () => void;
  saveDashboard: () => void;
  manageLayouts: () => void;
  manageStates: () => void;
  toggleVersionControl: () => void;
  openFilters: () => void;
  openEntityAliases: () => void;
  openDashboardSettings: () => void;
  updateDashboardImage: () => void;
  addWidget: () => void;
  selectBreakpoint: () => void;
}

interface Props {
  dashboard: Dashboard;
  flags: DashboardToolbarFlags;
  handlers: DashboardToolbarHandlers;
  /** Các vùng con (states, timewindow, filters, alias select, dashboard select) */
  children: {
    leftMiddle: ReactNode;
    rightExtras: ReactNode;
  };
}

/**
 * Mirror cấu trúc nút trên `tb-dashboard-toolbar` trong Angular template
 * (dashboard-page.component.html — khu vực action panels).
 */
export function DashboardToolbarFull({ dashboard, flags, handlers, children }: Props) {
  const hideMainToolbar = flags.widgetEditMode || flags.hideToolbar;

  return (
    <section
      style={{
        borderBottom: "1px solid #e0e0e0",
        background: "#fff",
        padding: "8px 12px",
      }}
    >
      {!hideMainToolbar && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {!flags.toolbarOpened && (
              <button type="button" onClick={handlers.openToolbar} title="Open toolbar">
                ⋮
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {children.leftMiddle}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {flags.showCloseToolbar && (
              <button type="button" onClick={handlers.closeToolbar} title="Close toolbar">
                →
              </button>
            )}
            {flags.showRightLayoutSwitch && (
              <button type="button" onClick={handlers.toggleLayouts} title="Toggle right layout">
                {flags.isRightLayoutOpened ? "⟨" : "☰"}
              </button>
            )}
            {!flags.hideFullscreenButton && (
              <button type="button" onClick={() => handlers.setFullscreen(!flags.isFullscreen)} title="Fullscreen">
                {flags.isFullscreen ? "⤓" : "⤢"}
              </button>
            )}
            {!!flags.currentDashboardId && !flags.isMobileApp && flags.displayExport && !flags.isEdit && (
              <button type="button" onClick={handlers.exportDashboard} title="Export">
                Export
              </button>
            )}
            {!flags.readonly && !flags.isEdit && (
              <button type="button" onClick={handlers.toggleEditMode} title="Edit mode">
                Edit
              </button>
            )}
            {flags.isEdit && (
              <>
                <button type="button" onClick={handlers.saveDashboard} disabled={flags.isLoading} title="Save">
                  Save
                </button>
                <button type="button" onClick={handlers.toggleEditMode} disabled={flags.isLoading} title="Cancel">
                  Cancel
                </button>
              </>
            )}
            {!!flags.currentDashboardId && flags.isEdit && flags.isTenantAdmin && (
              <button type="button" onClick={handlers.toggleVersionControl} title="Version control">
                History
              </button>
            )}
            {flags.isEdit && (
              <>
                <button type="button" onClick={handlers.openFilters} title="Filters">
                  Filters
                </button>
                <button type="button" onClick={handlers.openEntityAliases} title="Entity aliases">
                  Aliases
                </button>
                <button type="button" onClick={handlers.openDashboardSettings} title="Settings">
                  Settings
                </button>
              </>
            )}
            {!!flags.currentDashboardId && !flags.isEdit && !flags.isMobileApp && flags.isTenantAdmin && flags.displayUpdateDashboardImage && (
              <button type="button" onClick={handlers.updateDashboardImage} title="Update image">
                Image
              </button>
            )}
            {flags.isEdit && (
              <>
                <button type="button" onClick={handlers.selectBreakpoint} title="Breakpoint">
                  Breakpoint
                </button>
                <button type="button" onClick={handlers.manageLayouts} title="Manage layouts">
                  Layouts
                </button>
                <button type="button" onClick={handlers.manageStates} title="Manage states">
                  States
                </button>
                <button type="button" onClick={handlers.addWidget} title="Add widget">
                  + Widget
                </button>
              </>
            )}
            {children.rightExtras}
          </div>
        </div>
      )}
      {hideMainToolbar && <div style={{ fontSize: 12, opacity: 0.7 }}>Toolbar hidden (widget edit / hideToolbar)</div>}
      <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>Dashboard: {dashboard.title}</div>
    </section>
  );
}
