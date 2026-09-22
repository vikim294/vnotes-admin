export interface MenuItemData {
  name: string;
  url: string;
  needPermission?: string;
}

export const menus: MenuItemData[] = [
  {
    name: "仪表盘",
    url: "/",
  },
  {
    name: "用户管理",
    url: "/user-management",
    needPermission: "admin:user:read",
  },
  {
    name: "审计日志",
    url: "/audit-logs",
    needPermission: "admin:audit:read",
  },
  {
    name: "不可见菜单",
    url: "/unknown",
    needPermission: "unknown",
  },
];
