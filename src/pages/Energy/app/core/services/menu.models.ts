export enum MenuId {
  dashboards = "dashboards",
}

export interface MenuSection {
  id: MenuId | string;
  name: string;
  type: "link" | "toggle";
  path: string;
  icon: string;
}

export const menuSectionMap = new Map<MenuId, MenuSection>([
  [
    MenuId.dashboards,
    {
      id: MenuId.dashboards,
      name: "dashboard.dashboards",
      type: "link",
      path: "/dashboards",
      icon: "dashboards",
    },
  ],
]);
