import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"

let accessToken: string | null = null

let refreshPromise: Promise<string | null> | null = null

const BASE = "/api"

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

interface ApiErrorBody {
  status?: number
  error?: string
  message?: string
  details?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  details?: Record<string, string>

  constructor(status: number, message: string, details?: Record<string, string>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const { data } = await axios.post<{ accessToken?: string }>(
        `${BASE}/auth/refresh`,
        undefined,
        { withCredentials: true },
      )
      accessToken = data.accessToken ?? null
      return accessToken
    } catch {
      accessToken = null
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

const client: AxiosInstance = axios.create({
  baseURL: BASE,
  withCredentials: true,
})

// Request interceptor — inject access token
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Response interceptor — on 401, try refresh + retry once
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean
    }

    if (error.response?.status === 401 && !config._retried) {
      config._retried = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`
        return client(config)
      }
    }

    const body = error.response?.data as ApiErrorBody | undefined
    const status = error.response?.status ?? 0
    throw new ApiError(
      status,
      body?.message ?? body?.error ?? error.message ?? "Request failed",
      body?.details,
    )
  },
)

export const api = {
  get: <T>(path: string) => client.get<T>(path).then((r) => r.data),

  post: <T>(path: string, body?: unknown) =>
    client.post<T>(path, body).then((r) => r.data),

  put: <T>(path: string, body?: unknown) =>
    client.put<T>(path, body).then((r) => r.data),

  delete: <T>(path: string) => client.delete<T>(path).then((r) => r.data),

  bootstrap: () => refreshAccessToken(),
}
