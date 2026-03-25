import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { dashboardConfigService } from "../../../../core/services/dashboardConfigService";
import { dashboardService } from "../../../../core/http/dashboardService";
import { userSettingsService, UserDashboardAction } from "../../../../core/http/userSettingsService";
import { dashboardUtilsService } from "../../../../core/services/dashboardUtilsService";
import { importExportService } from "../../../../shared/import-export/importExportService";
import {
  createEmptyDashboardConfiguration,
  type Dashboard,
  type DashboardStateModel,
  type DashboardTimewindowValue,
  type Widget,
} from "../../../../shared/models/dashboard.models";
import { getWidgetsByLayoutForState } from "../../../../shared/models/dashboardLayoutUtils";
import { DashboardSelect } from "../dashboard/DashboardSelect";
import { VersionControlPanel } from "../vc/VersionControlPanel";
import { getDashboardPagePathForId } from "./dashboardNavigation";
import { DialogOverlay } from "./DialogOverlay";
import { DashboardLayoutGrid } from "./DashboardLayoutGrid";
import { DashboardToolbarFull } from "./DashboardToolbarFull";
import { DashboardWidgetSelect } from "./DashboardWidgetSelect";
import { EditWidgetDrawer } from "./EditWidgetDrawer";
import { StatesComponent } from "./StatesComponent";
import { DashboardTimewindow } from "./timewindow/DashboardTimewindow";
import { useDashboardPageRoute } from "./useDashboardPageRoute";
import { createWidgetEditorDashboard } from "./widgetEditorDashboard";
import { BreakpointModal, type DashboardBreakpointId } from "./dialogs/BreakpointModal";
import { DashboardImageForm } from "./dialogs/DashboardImageForm";
import { DashboardSettingsForm } from "./dialogs/DashboardSettingsForm";
import { HotkeysModalContent } from "./dialogs/HotkeysModal";
import { JsonRecordEditor } from "./dialogs/JsonRecordEditor";
import { ManageLayoutsForm } from "./dialogs/ManageLayoutsForm";
import { ManageStatesForm } from "./dialogs/ManageStatesForm";

type ActiveDialog =
  | null
  | "filters"
  | "entityAliases"
  | "dashboardSettings"
  | "manageLayouts"
  | "manageStates"
  | "versionControl"
  | "updateImage"
  | "breakpoint"
  | "hotkeys";

export function DashboardPage() {
  const navigate = useNavigate();
  const route = useDashboardPageRoute();
  const params = useParams();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEdit, setIsEdit] = useState(false);
  const [state, setState] = useState("default");
  const [selectedDashboardId, setSelectedDashboardId] = useState("");
  const [toolbarOpened, setToolbarOpened] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRightLayoutOpened, setIsRightLayoutOpened] = useState(false);
  const [layoutsMainShow, setLayoutsMainShow] = useState(true);
  const [layoutsRightShow, setLayoutsRightShow] = useState(true);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [editingWidget, setEditingWidget] = useState<{ id: string; widget: Widget } | null>(null);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [breakpoint, setBreakpoint] = useState<DashboardBreakpointId>("default");

  const isTenantAdmin = true;
  const isMobileApp = false;

  const dashboardIdParam = route.dashboardId ?? (params as { dashboardId?: string }).dashboardId;

  const loadDashboard = useCallback(async () => {
    if (route.widgetEditMode) {
      const mock = createWidgetEditorDashboard();
      setDashboard(dashboardUtilsService.validateAndUpdateDashboard(mock));
      setTitle(mock.title);
      setSelectedDashboardId(mock.id.id);
      return;
    }
    if (!dashboardIdParam) {
      setError("Missing dashboard id");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDashboard(dashboardIdParam);
      let normalized = dashboardUtilsService.validateAndUpdateDashboard(result);
      if (!normalized.configuration) {
        normalized = { ...normalized, configuration: createEmptyDashboardConfiguration() };
      }
      setDashboard(normalized);
      setTitle(normalized.title);
      setSelectedDashboardId(normalized.id.id);
      await userSettingsService.reportUserDashboardAction(normalized.id.id, UserDashboardAction.VISIT);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [dashboardIdParam, route.widgetEditMode]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const settings = dashboard?.configuration?.settings ?? {};

  const displayExport = settings.showDashboardExport !== false;
  const displayTitle = settings.showTitle === true;
  const displayUpdateDashboardImage = settings.showUpdateDashboardImage !== false;
  const displayDashboardTimewindow = settings.showDashboardTimewindow !== false;
  const displayDashboardsSelect = settings.showDashboardsSelect !== false && !route.widgetEditMode;
  const displayEntitiesSelect = settings.showEntitiesSelect !== false;
  const displayFilters = settings.showFilters !== false;
  const toolbarAlwaysOpen = settings.toolbarAlwaysOpen !== false;
  const hideToolbarSetting = settings.hideToolbar === true;

  const hideToolbar = hideToolbarSetting && !isFullscreen;
  const widgetEditMode = route.widgetEditMode;

  const toolbarOpenedComputed =
    !widgetEditMode &&
    !hideToolbar &&
    (toolbarAlwaysOpen || toolbarOpened || isEdit || layoutsRightShow);

  const showCloseToolbar = !toolbarAlwaysOpen && !isEdit && !layoutsRightShow;
  const hideFullscreenButton = widgetEditMode || isFullscreen || route.singlePageMode;
  const showRightLayoutSwitch = layoutsRightShow;

  const currentDashboardId = selectedDashboardId;

  const filtersCount = useMemo(() => Object.keys(dashboard?.configuration?.filters ?? {}).length, [dashboard]);
  const aliasesCount = useMemo(() => Object.keys(dashboard?.configuration?.entityAliases ?? {}).length, [dashboard]);

  const saveDashboardToServer = useCallback(async (d?: Dashboard) => {
    const toSave = d ?? dashboard;
    if (!toSave) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { ...toSave, title: title.trim() || toSave.title };
      const saved = await dashboardService.saveDashboard(payload);
      setDashboard(saved);
      setTitle(saved.title);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save dashboard");
    } finally {
      setSaving(false);
    }
  }, [dashboard, title]);

  const navigateAfterDashboardChange = useCallback(
    (nextId: string) => {
      navigate(
        getDashboardPagePathForId(nextId, {
          singlePageMode: route.singlePageMode,
          customerId: route.customerId,
          edgeId: route.edgeId,
        })
      );
    },
    [navigate, route.customerId, route.edgeId, route.singlePageMode]
  );

  const patchDashboard = useCallback((fn: (d: Dashboard) => Dashboard) => {
    setDashboard((prev) => (prev ? fn(prev) : prev));
  }, []);

  const handlers = useMemo(
    () => ({
      openToolbar: () => setToolbarOpened(true),
      closeToolbar: () => setToolbarOpened(false),
      toggleLayouts: () => setIsRightLayoutOpened((v) => !v),
      setFullscreen: setIsFullscreen,
      exportDashboard: () => {
        if (currentDashboardId) {
          void importExportService.exportDashboard(currentDashboardId);
        }
      },
      toggleEditMode: () => setIsEdit((v) => !v),
      saveDashboard: () => void saveDashboardToServer(),
      manageLayouts: () => setActiveDialog("manageLayouts"),
      manageStates: () => setActiveDialog("manageStates"),
      toggleVersionControl: () => setActiveDialog("versionControl"),
      openFilters: () => setActiveDialog("filters"),
      openEntityAliases: () => setActiveDialog("entityAliases"),
      openDashboardSettings: () => setActiveDialog("dashboardSettings"),
      updateDashboardImage: () => setActiveDialog("updateImage"),
      addWidget: () => {
        setIsAddingWidget(true);
        setEditingWidget(null);
      },
      selectBreakpoint: () => setActiveDialog("breakpoint"),
    }),
    [currentDashboardId, saveDashboardToServer]
  );

  const flags = useMemo(
    () => ({
      widgetEditMode,
      hideToolbar,
      toolbarOpened: toolbarOpenedComputed,
      isFullscreen,
      isMobileApp,
      currentDashboardId,
      readonly: route.readonly,
      isTenantAdmin,
      isEdit,
      isLoading: loading || saving,
      showCloseToolbar,
      hideFullscreenButton,
      displayExport,
      displayUpdateDashboardImage,
      displayDashboardTimewindow,
      displayDashboardsSelect,
      displayEntitiesSelect,
      displayFilters,
      showRightLayoutSwitch,
      isRightLayoutOpened,
    }),
    [
      widgetEditMode,
      hideToolbar,
      toolbarOpenedComputed,
      isFullscreen,
      currentDashboardId,
      route.readonly,
      isEdit,
      loading,
      saving,
      showCloseToolbar,
      hideFullscreenButton,
      displayExport,
      displayUpdateDashboardImage,
      displayDashboardTimewindow,
      displayDashboardsSelect,
      displayEntitiesSelect,
      displayFilters,
      showRightLayoutSwitch,
      isRightLayoutOpened,
    ]
  );

  function onTimewindowChange(next: DashboardTimewindowValue | null) {
    patchDashboard((d) => dashboardConfigService.patchConfiguration(d, { timewindow: next }));
  }

  function onWidgetPicked(typeKey: string) {
    patchDashboard((d) =>
      dashboardConfigService.addWidget(
        d,
        {
          typeFullFqn: `system.${typeKey}`,
          type: "timeseries",
          sizeX: 6,
          sizeY: 4,
          row: 0,
          col: 0,
          config: { title: `New ${typeKey}` },
        },
        { stateId: state }
      )
    );
    setIsAddingWidget(false);
  }

  function onMoveWidgetToLayout(widgetId: string, targetLayout: "main" | "right") {
    patchDashboard((d) => dashboardConfigService.moveWidgetToLayout(d, state, widgetId, targetLayout));
  }

  function onReorderWidgets(layoutId: "main" | "right", orderedIds: string[]) {
    patchDashboard((d) => dashboardConfigService.reorderWidgetsInLayout(d, state, layoutId, orderedIds));
  }

  if (loading && !dashboard) {
    return <div style={{ padding: 16 }}>Loading dashboard…</div>;
  }
  if (error && !dashboard) {
    return (
      <div style={{ padding: 16, color: "crimson" }}>
        {error}
        <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate("/dashboards")}>
          Back
        </button>
      </div>
    );
  }
  if (!dashboard) {
    return null;
  }

  const titleColor = settings.titleColor ?? "#333";
  const layoutWidgets = getWidgetsByLayoutForState(dashboard.configuration, state);
  const stateIds = Object.keys(dashboard.configuration?.states ?? { default: {} });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <DashboardToolbarFull
        dashboard={dashboard}
        flags={flags}
        handlers={handlers}
        children={{
          leftMiddle: (
            <>
              <StatesComponent states={stateIds} currentState={state} onChange={setState} />
              <span style={{ fontSize: 11, opacity: 0.6 }}>bp:{breakpoint}</span>
            </>
          ),
          rightExtras: (
            <>
              {displayDashboardTimewindow && (
                <DashboardTimewindow
                  value={dashboard.configuration?.timewindow as DashboardTimewindowValue | undefined}
                  isEdit={isEdit}
                  onChange={onTimewindowChange}
                  showSaveAsDefault={!route.readonly}
                  onSaveAsDefault={() => void saveDashboardToServer()}
                />
              )}
              {!isEdit && displayFilters && (
                <button type="button" onClick={() => setActiveDialog("filters")} title="tb-filters-edit">
                  Filters ({filtersCount})
                </button>
              )}
              {!isEdit && displayEntitiesSelect && (
                <button type="button" onClick={() => setActiveDialog("entityAliases")} title="tb-aliases-entity-select">
                  Aliases ({aliasesCount})
                </button>
              )}
              {!isEdit && !widgetEditMode && !route.embedded && displayDashboardsSelect && (
                <DashboardSelect value={selectedDashboardId} onChange={(id) => navigateAfterDashboardChange(id)} />
              )}
            </>
          ),
        }}
      />

      <section style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        {!widgetEditMode && (
          <div style={{ color: titleColor }}>
            {!isEdit && displayTitle && <h2 style={{ margin: 0 }}>{title}</h2>}
            {isEdit && (
              <label style={{ display: "block" }}>
                Title
                <input
                  style={{ width: "100%", maxWidth: 480, marginTop: 4 }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: layoutsRightShow ? "1fr 1fr" : "1fr", gap: 12, flex: 1 }}>
          {layoutsMainShow && (
            <DashboardLayoutGrid
              layoutId="main"
              widgets={layoutWidgets.main}
              isEdit={isEdit}
              onMoveWidgetToLayout={isEdit ? onMoveWidgetToLayout : undefined}
              onReorderWidgets={isEdit ? (ids) => onReorderWidgets("main", ids) : undefined}
              onWidgetClick={(id, w) => {
                if (isEdit) {
                  setEditingWidget({ id, widget: w });
                  setIsAddingWidget(false);
                }
              }}
            />
          )}
          {layoutsRightShow && (
            <DashboardLayoutGrid
              layoutId="right"
              widgets={layoutWidgets.right}
              isEdit={isEdit}
              onMoveWidgetToLayout={isEdit ? onMoveWidgetToLayout : undefined}
              onReorderWidgets={isEdit ? (ids) => onReorderWidgets("right", ids) : undefined}
              onWidgetClick={(id, w) => {
                if (isEdit) {
                  setEditingWidget({ id, widget: w });
                  setIsAddingWidget(false);
                }
              }}
            />
          )}
        </div>

        {!route.readonly && (hideToolbar || widgetEditMode) && (
          <div style={{ display: "flex", gap: 8 }}>
            {!isEdit && (
              <button type="button" onClick={() => setIsEdit(true)}>
                Enter edit (FAB)
              </button>
            )}
            {isEdit && (
              <>
                <button type="button" onClick={() => void saveDashboardToServer()} disabled={saving}>
                  Save
                </button>
                <button type="button" onClick={() => setIsEdit(false)} disabled={saving}>
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

        {isEdit && (
          <div style={{ border: "1px dashed #ccc", padding: 8 }}>
            <button type="button" onClick={handlers.addWidget}>
              Add widget (drawer)
            </button>
          </div>
        )}

        <footer style={{ fontSize: 12, opacity: 0.7 }}>
          Powered by ThingsBoard (React) —{" "}
          <a href="https://thingsboard.io" target="_blank" rel="noreferrer">
            thingsboard.io
          </a>
        </footer>
      </section>

      {(isAddingWidget || editingWidget) && (
        <div
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            width: 400,
            background: "#eceff1",
            borderLeft: "1px solid #ccc",
            padding: 12,
            zIndex: 50,
            overflow: "auto",
            boxShadow: "-2px 0 8px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong>{editingWidget ? "Edit widget" : "Add widget"}</strong>
            <button
              type="button"
              onClick={() => {
                setIsAddingWidget(false);
                setEditingWidget(null);
              }}
            >
              Close
            </button>
          </div>
          {isAddingWidget && !widgetEditMode && <DashboardWidgetSelect onSelect={onWidgetPicked} />}
          {editingWidget && (
            <EditWidgetDrawer
              widget={editingWidget.widget}
              onApply={(w) => {
                patchDashboard((d) => dashboardConfigService.updateWidget(d, editingWidget.id, w));
                setEditingWidget(null);
              }}
              onRemove={() => {
                patchDashboard((d) => dashboardConfigService.removeWidget(d, editingWidget.id));
                setEditingWidget(null);
              }}
              onClose={() => setEditingWidget(null)}
            />
          )}
        </div>
      )}

      <DialogOverlay title="Filters (JSON)" open={activeDialog === "filters"} onClose={() => setActiveDialog(null)} wide>
        <JsonRecordEditor
          title="dashboard.configuration.filters"
          value={(dashboard.configuration?.filters as Record<string, unknown>) ?? {}}
          onSave={(next) => {
            patchDashboard((d) => dashboardConfigService.patchConfiguration(d, { filters: next }));
            setActiveDialog(null);
          }}
          onCancel={() => setActiveDialog(null)}
        />
      </DialogOverlay>

      <DialogOverlay title="Entity aliases (JSON)" open={activeDialog === "entityAliases"} onClose={() => setActiveDialog(null)} wide>
        <JsonRecordEditor
          title="dashboard.configuration.entityAliases"
          value={(dashboard.configuration?.entityAliases as Record<string, unknown>) ?? {}}
          onSave={(next) => {
            patchDashboard((d) => dashboardConfigService.patchConfiguration(d, { entityAliases: next }));
            setActiveDialog(null);
          }}
          onCancel={() => setActiveDialog(null)}
        />
      </DialogOverlay>

      <DialogOverlay title="Dashboard settings" open={activeDialog === "dashboardSettings"} onClose={() => setActiveDialog(null)}>
        <DashboardSettingsForm
          settings={settings}
          onSave={(next) => {
            patchDashboard((d) => dashboardConfigService.patchConfiguration(d, { settings: { ...d.configuration?.settings, ...next } }));
            setActiveDialog(null);
          }}
          onCancel={() => setActiveDialog(null)}
        />
      </DialogOverlay>

      <DialogOverlay title="Manage layouts" open={activeDialog === "manageLayouts"} onClose={() => setActiveDialog(null)}>
        <ManageLayoutsForm
          showMain={layoutsMainShow}
          showRight={layoutsRightShow}
          onSave={(main, right) => {
            setLayoutsMainShow(main);
            setLayoutsRightShow(right);
            setActiveDialog(null);
          }}
          onCancel={() => setActiveDialog(null)}
        />
      </DialogOverlay>

      <DialogOverlay title="Manage states" open={activeDialog === "manageStates"} onClose={() => setActiveDialog(null)}>
        <ManageStatesForm
          stateIds={stateIds}
          onSave={(ids) => {
            const prevStates = dashboard.configuration?.states ?? {};
            const nextStates: Record<string, DashboardStateModel> = {};
            for (const id of ids) {
              nextStates[id] =
                prevStates[id] ??
                ({
                  name: id,
                  root: id === "default",
                  layouts: {
                    main: { widgets: {} },
                    right: { widgets: {} },
                  },
                } satisfies DashboardStateModel);
            }
            patchDashboard((d) => dashboardConfigService.patchConfiguration(d, { states: nextStates }));
            if (!ids.includes(state)) {
              setState(ids[0] ?? "default");
            }
            setActiveDialog(null);
          }}
          onCancel={() => setActiveDialog(null)}
        />
      </DialogOverlay>

      <DialogOverlay title="Update dashboard image" open={activeDialog === "updateImage"} onClose={() => setActiveDialog(null)}>
        <DashboardImageForm
          currentImage={dashboard.image}
          onSave={(dataUrl) => {
            setDashboard((d) => (d ? { ...d, image: dataUrl ?? undefined } : d));
            setActiveDialog(null);
          }}
          onCancel={() => setActiveDialog(null)}
        />
      </DialogOverlay>

      <DialogOverlay title="Version control" open={activeDialog === "versionControl"} onClose={() => setActiveDialog(null)} wide>
        {currentDashboardId && <VersionControlPanel dashboardId={currentDashboardId} />}
        <button type="button" style={{ marginTop: 12 }} onClick={() => setActiveDialog(null)}>
          Close
        </button>
      </DialogOverlay>

      <DialogOverlay title="Breakpoint" open={activeDialog === "breakpoint"} onClose={() => setActiveDialog(null)}>
        <BreakpointModal
          current={breakpoint}
          onSave={(bp) => {
            setBreakpoint(bp);
            setActiveDialog(null);
          }}
          onCancel={() => setActiveDialog(null)}
        />
      </DialogOverlay>

      <DialogOverlay title="Hotkeys" open={activeDialog === "hotkeys"} onClose={() => setActiveDialog(null)}>
        <HotkeysModalContent />
      </DialogOverlay>

      <div style={{ padding: 8, borderTop: "1px solid #eee", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => navigate(route.singlePageMode ? "/home" : "/dashboards")}>
          {route.singlePageMode ? "Back home" : "Back to dashboards"}
        </button>
        <button type="button" onClick={() => setActiveDialog("hotkeys")}>
          Hotkeys
        </button>
      </div>
    </div>
  );
}
