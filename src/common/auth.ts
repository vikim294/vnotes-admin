const TOKEN_KEY = "vnote-admin-token";
const PERMISSIONS_KEY = "vnote-admin-permissions";
const ADMIN_EMAIL_KEY = "vnote-admin-email";

interface AuthSession {
  accessToken: string;
  permissions: string[];
  email: string;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserPermissions(): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(PERMISSIONS_KEY) || "[]",
    );

    return Array.isArray(value)
      ? value.filter((permission): permission is string =>
          typeof permission === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function getAdminEmail() {
  return localStorage.getItem(ADMIN_EMAIL_KEY) || "管理员";
}

export function saveAuthSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(session.permissions));
  localStorage.setItem(ADMIN_EMAIL_KEY, session.email);
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PERMISSIONS_KEY);
  localStorage.removeItem(ADMIN_EMAIL_KEY);
}
