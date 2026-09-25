export interface MenuItemData {
  key: string;
  name: string;
  url: string;
  icon: "dashboard" | "users" | "roles" | "permissions" | "audit";
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
  {
    key: "roles",
    name: "角色管理",
    url: "/role-management",
    icon: "roles",
    needPermission: "admin:role:read",
  },
  {
    key: "permissions",
    name: "权限管理",
    url: "/permission-management",
    icon: "permissions",
    needPermission: "admin:permission:read",
  },
  {
    key: "audit",
    name: "审计日志",
    url: "/audit-logs",
    icon: "audit",
    needPermission: "admin:audit:read",
  },
];
