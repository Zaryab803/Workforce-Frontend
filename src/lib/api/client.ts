import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const TOKEN_KEY = "orbit_access_token";

let inMemoryToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  inMemoryToken = token;
  if (typeof window !== "undefined") {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }
}

export function getAccessToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        inMemoryToken = stored;
        return stored;
      }
    } catch {
      // Ignore
    }
  }
  return null;
}

const rawApiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const cleanApiUrl = rawApiUrl.replace(/\/+$/, "");
const API_BASE = cleanApiUrl.endsWith("/api/v1")
  ? cleanApiUrl
  : `${cleanApiUrl}/api/v1`;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Protection": "1",
  },
});

export async function restoreSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { "X-CSRF-Protection": "1" },
        },
      );
      const token =
        res.data?.data?.accessToken || res.data?.accessToken || null;
      setAccessToken(token);
      return token;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Request interceptor to attach Bearer access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    config.headers.set("X-CSRF-Protection", "1");
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to unwrap enveloped responses and handle auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    const raw = response.data;
    if (raw && typeof raw === "object" && raw.success === true) {
      if (raw.meta && typeof raw.meta === "object") {
        response.data = {
          items: raw.data,
          total: raw.meta.total,
          page: raw.meta.page,
          limit: raw.meta.limit,
          pages: raw.meta.totalPages || 1,
        };
      } else if (raw.data !== undefined) {
        response.data = raw.data;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean;
    };

    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retried = true;
      const newToken = await restoreSession();
      if (newToken) {
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }
    }

    if (isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const data = error.response?.data;
      const code =
        (typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "object" &&
          data.error !== null &&
          "code" in data.error &&
          typeof data.error.code === "string" &&
          data.error.code) ||
        undefined;

      const message =
        (typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "object" &&
          data.error !== null &&
          "message" in data.error &&
          typeof data.error.message === "string" &&
          data.error.message) ||
        (typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof data.message === "string" &&
          data.message) ||
        (typeof data === "string" && data ? data : undefined) ||
        error.message ||
        "Unable to complete this request.";

      return Promise.reject(new ApiError(status, message, code));
    }
    return Promise.reject(error);
  },
);

/**
 * Generic API request helper using the configured Axios client
 */
export async function api<T>(
  url: string,
  options?: (AxiosRequestConfig & { body?: unknown }) | RequestInit,
): Promise<T> {
  const method = (options?.method as string) || "GET";
  let data = (options as AxiosRequestConfig)?.data;

  if (
    data === undefined &&
    (options as { body?: unknown })?.body !== undefined
  ) {
    const rawBody = (options as { body?: unknown }).body;
    if (typeof rawBody === "string") {
      try {
        data = rawBody.trim() ? JSON.parse(rawBody) : undefined;
      } catch {
        data = rawBody;
      }
    } else {
      data = rawBody;
    }
  }

  const response = await apiClient.request<T>({
    url,
    method,
    data,
    headers: options?.headers as Record<string, string>,
  });

  return response.data;
}

export const json = (
  method: string,
  data?: unknown,
): { method: string; data?: unknown } => ({
  method,
  data,
});
