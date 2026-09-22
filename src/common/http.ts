import { clearAuthSession, getAccessToken } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

export class HttpError extends Error {
  status: number;
  code?: number;

  constructor(message: string, status = 0, code?: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

function redirectToLogin() {
  clearAuthSession();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, body, headers: customHeaders, ...requestInit } = options;
  const headers = new Headers(customHeaders);
  const token = getAccessToken();

  if (auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestInit,
      headers,
      body: requestBody,
    });
  } catch {
    throw new HttpError("无法连接服务器，请确认后端服务已启动");
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    // 非 JSON 响应继续交给下面的统一错误处理。
  }

  if (response.status === 401 && auth) {
    redirectToLogin();
    throw new HttpError(payload?.message || "登录状态已失效", 401, payload?.code);
  }

  if (!response.ok || !payload || payload.code !== 0) {
    throw new HttpError(
      payload?.message || `请求失败（${response.status}）`,
      response.status,
      payload?.code,
    );
  }

  return payload.data;
}
