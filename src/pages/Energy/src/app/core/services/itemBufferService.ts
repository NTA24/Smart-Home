export interface ClipboardWidget {
  id: string;
  title?: string;
}

let cachedWidget: ClipboardWidget | null = null;

export const itemBufferService = {
  copyWidget(widget: ClipboardWidget) {
    cachedWidget = widget;
  },
  hasWidget() {
    return Boolean(cachedWidget);
  },
  pasteWidget(): ClipboardWidget | null {
    return cachedWidget ? { ...cachedWidget, id: `${cachedWidget.id}-copy` } : null;
  },
};
