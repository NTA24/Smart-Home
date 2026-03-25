export interface WidgetInfo {
  typeFullFqn: string;
  widgetName: string;
  sizeX: number;
  sizeY: number;
}

export const widgetComponentService = {
  async getWidgetInfo(typeFullFqn: string): Promise<WidgetInfo> {
    const response = await fetch(`/api/widget/types/${encodeURIComponent(typeFullFqn)}`);
    if (!response.ok) {
      return {
        typeFullFqn,
        widgetName: "Widget",
        sizeX: 4,
        sizeY: 3,
      };
    }
    return (await response.json()) as WidgetInfo;
  },
};
