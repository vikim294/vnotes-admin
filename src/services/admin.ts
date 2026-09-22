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
  createdAt: string;
  updatedAt: string;
}

export function login(params: LoginParams) {
  return request<LoginResponse>("/admin/auth/login", {
    method: "POST",
    body: params,
    auth: false,
  });
}

export function getUserList() {
  return request<AdminUser[]>("/admin/user/list");
}
