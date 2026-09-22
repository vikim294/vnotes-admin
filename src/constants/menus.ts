export interface MenuItemData {
  key: string;
  name: string;
  url: string;
  icon: "dashboard" | "users";
  needPermission?: string;
}

export const menus: MenuItemData[] = [
  {
    key: "dashboard",
    name: "仪表盘",
    url: "/",
    icon: "dashboard",
  },
  {
    key: "users",
    name: "用户管理",
    url: "/user-management",
    icon: "users",
    needPermission: "admin:user:read",
  },
];
