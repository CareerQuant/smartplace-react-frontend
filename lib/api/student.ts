import { apiClient } from "./client"
import type { Student } from "@/lib/types"

export async function getStudents(userId?: string): Promise<Student[]> {
  const params = userId ? `?user_id=${userId}` : ""
  return apiClient<Student[]>(`/api/student/${params}`)
}



export async function getExecutiveStudents(userId?: string): Promise<Student[]> {
  const url = userId
    ? `/api/student/?user_id=${userId}`
    : "/api/student/"

  const response = await apiClient<any>(url)
  return response?.data ?? []
}

export async function getESStudents(): Promise<Student[]> {
  const response = await apiClient<any>("/api/student/")
  return response?.data ?? []
}

export async function getStudent(userId: number | string): Promise<Student> {
  return apiClient<Student>(`/api/student/${userId}/`)
}

export async function createStudent(data: Student): Promise<Student> {
  return apiClient<Student>("/api/student/", {
    method: "POST",
    body: data,
  })
}

export async function updateStudent(userId: string, payload: any) {
  return apiClient(`/api/student/${userId}/`, {
    method: "PATCH",
    body: payload,
  })
}
export async function getStudentById(userId: string) {
  return apiClient(`/api/student/?user_id=${userId}/`)
}
