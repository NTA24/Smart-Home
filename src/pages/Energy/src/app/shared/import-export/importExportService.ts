export const importExportService = {
  async exportDashboard(dashboardId: string): Promise<void> {
    window.open(`/api/dashboard/${dashboardId}/export`, "_blank");
  },
  async importDashboard(file: File): Promise<void> {
    const form = new FormData();
    form.append("file", file);
    await fetch("/api/dashboard/import", { method: "POST", body: form });
  },
};
