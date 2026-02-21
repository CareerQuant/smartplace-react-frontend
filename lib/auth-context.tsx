"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { DecodedToken } from "@/lib/types"
import { login as apiLogin } from "@/lib/api/auth"
import { logout as apiLogout } from "@/lib/api/auth"
import { clearTokens } from "@/lib/api/client"

interface AuthState {
  user: DecodedToken | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  role: "student" | "executive" | "admin" | null
  login: (email: string, password: string) => Promise<DecodedToken>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload))
    return decoded as DecodedToken
  } catch {
    return null
  }
}

function isTokenExpired(decoded: DecodedToken): boolean {
  return decoded.exp * 1000 < Date.now()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DecodedToken | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedAccess = localStorage.getItem("access_token")
    const storedRefresh = localStorage.getItem("refresh_token")
    const storedRole = localStorage.getItem("user_role")
    const storedEmail = localStorage.getItem("user_email")
    const storedUserId = localStorage.getItem("user_id")

    if (storedAccess) {
      const decoded = decodeToken(storedAccess)
      if (decoded && !isTokenExpired(decoded)) {
        let enrichedUser = decoded
        // Always enrich with localStorage values if present
        if (storedRole && storedUserId && storedEmail) {
          enrichedUser = {
            ...decoded,
            role: storedRole.toLowerCase(),
            user_id: storedUserId,
            email: storedEmail,
          }
        }
        setUser(enrichedUser)
        setAccessToken(storedAccess)
        setRefreshToken(storedRefresh)
      } else {
        // Token expired — clear
        clearTokens()
      }
    }

    setIsLoading(false)
  }, [])

  // const login = useCallback(async (email: string, password: string) => {
  //   const response = await apiLogin({ email, password })

  //   const access = response.access
  //   const refresh = response.refresh

  //   localStorage.setItem("access_token", access)
  //   localStorage.setItem("refresh_token", refresh)

  //   const decoded = decodeToken(access)
  //   if (!decoded) throw new Error("Invalid token received")

  //   setUser(decoded)
  //   setAccessToken(access)
  //   setRefreshToken(refresh)

  //   return decoded
  // }, [])
  const login = useCallback(async (email: string, password: string) => {
  const response = await apiLogin({ email, password })

  const { access, refresh, role, userId, user_mail } = response

  localStorage.setItem("access_token", access)
  localStorage.setItem("refresh_token", refresh)
  localStorage.setItem("user_role", role)
  localStorage.setItem("user_email", user_mail)
  localStorage.setItem("user_id", String(userId))

  const decoded = decodeToken(access)
  if (!decoded) throw new Error("Invalid token received")

  type AppRole = "student" | "executive" | "admin"
  const normalizedRole = role.toLowerCase() as AppRole

  const enrichedUser: DecodedToken = {
    ...decoded,
    role: normalizedRole,
    user_id: userId,
    email: user_mail,
  }

  setUser(enrichedUser)
  setAccessToken(access)
  setRefreshToken(refresh)

  return enrichedUser
}, [])

  const logout = useCallback(async () => {
    try {
      const refresh = localStorage.getItem("refresh_token")
      if (refresh) {
        await apiLogout({ refresh_token: refresh })
      }
    } catch {
      // Logout API failure is non-critical
    } finally {
      clearTokens()
      setUser(null)
      setAccessToken(null)
      setRefreshToken(null)
    }
  }, [])

  const value = useMemo<AuthState>(
  () => ({
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!user,
    isLoading,
    role:
  user?.role
    ? (user.role.toLowerCase() as "student" | "executive" | "admin")
    : null,
    login,
    logout,
  }),
  [user, accessToken, refreshToken, isLoading, login, logout]
)

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
