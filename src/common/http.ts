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

export interface FileResponse {
  blob: Blob;
  fileName: string | null;
}

// HttpError 的作用是把请求阶段的各种失败 统一转换成一种“带上下文的错误”，然后由具体调用页面通过 try-catch 灵活决定如何处理
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

async function sendRequest(path: string, options: RequestOptions) {
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

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestInit,
      headers,
      body: requestBody,
    });

    return { response, auth };
  } catch {
    throw new HttpError("无法连接服务器，请确认后端服务已启动");
  }
}

function getFileName(response: Response) {
  const disposition = response.headers.get("Content-Disposition");
  if (!disposition) return null;

  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch) {
    try {
      return decodeURIComponent(encodedMatch[1]);
    } catch {
      return encodedMatch[1];
    }
  }

  return disposition.match(/filename="([^"]+)"/i)?.[1]
    ?? disposition.match(/filename=([^;]+)/i)?.[1]?.trim()
    ?? null;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { response, auth } = await sendRequest(path, options);

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

export async function requestFile(
  path: string,
  options: RequestOptions = {},
): Promise<FileResponse> {
  const { response, auth } = await sendRequest(path, options);

  if (response.ok) {
    return {
      blob: await response.blob(),
      fileName: getFileName(response),
    };
  }

  let payload: ApiResponse<unknown> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<unknown>;
  } catch {
    // 文件接口失败时也可能返回非 JSON 内容，继续使用统一兜底文案。
  }

  if (response.status === 401 && auth) {
    redirectToLogin();
    throw new HttpError(payload?.message || "登录状态已失效", 401, payload?.code);
  }

  throw new HttpError(
    payload?.message || `文件下载失败（${response.status}）`,
    response.status,
    payload?.code,
  );
}
