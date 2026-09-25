import { request } from "../common/http";

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  roles: string[];
  permissions: string[];
}

export interface AdminUser {
  id: number;
  email: string;
  status: "ACTIVE" | "DISABLED";
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: number;
  name: string;
  builtIn: boolean;
}

export interface ClientUser {
  id: number;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  status: "ACTIVE" | "DISABLED";
  noteCount: number;
  sharedNoteCount: number;
  articleCount: number;
  createdAt: string;
}

export interface AdminRole {
  id: number;
  code: string;
  name: string;
  description: string | null;
  builtIn: boolean;
  permissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  id: number;
  code: string;
  name: string;
}

export interface AdminPermission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AdminAuditAction =
  | "ADD_USER"
  | "ENABLE_USER"
  | "DISABLE_USER"
  | "ASSIGN_ROLE"
  | "CREATE_ROLE"
  | "UPDATE_ROLE"
  | "DELETE_ROLE"
  | "ASSIGN_PERMISSION"
  | "ENABLE_CLIENT_USER"
  | "DISABLE_CLIENT_USER";

export interface AdminAuditLog {
  id: number;
  userId: number;
  action: AdminAuditAction;
  description: string | null;
  createdAt: string;
}

export function login(params: LoginParams) {
  return request<LoginResponse>("/admin/auth/login", {
    method: "POST",
    body: params,
    auth: false,
  });
}

export function getUserList() {
  return request<AdminUser[]>("/admin/user/list-with-roles");
}

export function addAdminUser(email: string) {
  return request<void>("/admin/user/add", {
    method: "POST",
    body: { email },
  });
}

export function changeAdminUserStatus(
  userId: number,
  status: AdminUser["status"],
) {
  return request<void>("/admin/user/enable-or-disable", {
    method: "PATCH",
    body: { userId, status },
  });
}

export function getClientUserList() {
  return request<ClientUser[]>("/admin/client-user/list");
}

export function changeClientUserStatus(
  userId: number,
  status: ClientUser["status"],
) {
  return request<void>("/admin/client-user/enable-or-disable", {
    method: "PATCH",
    body: { userId, status },
  });
}

export function getRoleList() {
  return request<AdminRole[]>("/admin/role/list-with-permissions");
}

export function assignRolesToUser(userId: number, roleIds: number[]) {
  return request<void>("/admin/user/assign-roles", {
    method: "POST",
    body: { userId, roleIds },
  });
}

export function createRole(params: Pick<AdminRole, "name" | "description">) {
  return request<void>("/admin/role", {
    method: "POST",
    body: params,
  });
}

export function updateRole(
  params: Pick<AdminRole, "id" | "name" | "description">,
) {
  return request<void>("/admin/role", {
    method: "PATCH",
    body: params,
  });
}

export function deleteRole(id: number) {
  return request<void>(`/admin/role/${id}`, { method: "DELETE" });
}

export function assignPermissionsToRole(
  roleId: number,
  permissionIds: number[],
) {
  return request<void>("/admin/role/assign-permissions", {
    method: "POST",
    body: { roleId, permissionIds },
  });
}

export function getPermissionList() {
  return request<AdminPermission[]>("/admin/permission/list");
}

export function getAuditLogList() {
  return request<AdminAuditLog[]>("/admin/audit/list");
}
