import type { ApiError } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refresh_token")
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access)
  localStorage.setItem("refresh_token", refresh)
}

export function clearTokens() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })

    if (!res.ok) {
      clearTokens()
      return null
    }

    const data = await res.json()
    setTokens(data.access, refresh)
    return data.access
  } catch {
    clearTokens()
    return null
  }
}

export class ApiClientError extends Error {
  status: number
  errors: Record<string, unknown>

  constructor(message: string, status: number, errors: Record<string, unknown> = {}) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.errors = errors
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  skipAuth?: boolean
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth = false, ...fetchOptions } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }

  const url = `${API_BASE_URL}${endpoint}`

  let res = await fetch(url, config)

  // On 401, try refreshing the token and retry once
  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`
      res = await fetch(url, { ...config, headers })
    } else {
      // Refresh failed — redirect to login
      if (typeof window !== "undefined") {
        clearTokens()
        window.location.href = "/login"
      }
      throw new ApiClientError("Session expired", 401)
    }
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const errorData = data as ApiError
    const message =
      errorData.detail || errorData.message || `Request failed with status ${res.status}`
    throw new ApiClientError(message, res.status, data as Record<string, unknown>)
  }

  return data as T
}

// Helper to flatten nested Django validation errors for react-hook-form
export function flattenErrors(
  errors: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const flat: Record<string, string> = {}

  for (const key in errors) {
    const path = prefix ? `${prefix}.${key}` : key
    const value = errors[key]

    if (Array.isArray(value)) {
      // Django sends arrays of error strings
      flat[path] = value.join(", ")
    } else if (typeof value === "object" && value !== null) {
      Object.assign(flat, flattenErrors(value as Record<string, unknown>, path))
    } else if (typeof value === "string") {
      flat[path] = value
    }
  }

  return flat
}
