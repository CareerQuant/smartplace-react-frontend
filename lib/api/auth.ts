import { apiClient } from "./client"
import type {
  LoginPayload,
  LoginResponse,
  LogoutPayload,
  RegisterPayload,
  User,
} from "@/lib/types"

// export async function login(payload: LoginPayload): Promise<LoginResponse> {
//   return apiClient<LoginResponse>("/api/auth/login/", {
//     method: "POST",
//     body: payload,
//     skipAuth: true,
//   })
// }
export async function login(payload: LoginPayload): Promise<{
  access: string
  refresh: string
  role: string
  userId: number
  user_mail:string
}> {
  const response = await apiClient<any>("/api/auth/login/", {
    method: "POST",
    body: payload,
    skipAuth: true,
  })

  console.log(response.data.user.email,)

  return {
    access: response.data.token.access,
    refresh: response.data.token.refresh,
    role: response.data.user.role,
    userId: response.data.user.id,
    user_mail: response.data.user.email,
  }
}

export async function logout(payload: LogoutPayload): Promise<void> {
  return apiClient<void>("/api/auth/logout/", {
    method: "POST",
    body: payload,
  })
}

export async function refreshToken(refresh: string) {
  return apiClient<{ access: string }>("/api/auth/refresh/", {
    method: "POST",
    body: { refresh },
    skipAuth: true,
  })
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  return apiClient<User>("/api/auth/users/", {
    method: "POST",
    body: payload,
    skipAuth: true,
  })
}

export async function getUsers(): Promise<User[]> {
  return apiClient<User[]>("/api/auth/users/")
}
