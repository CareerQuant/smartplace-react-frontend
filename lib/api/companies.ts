import { apiClient } from "./client"
import type { Company } from "@/lib/types"

export async function getCompanies(): Promise<Company[]> {
  const response = await apiClient<any>("/api/companies/")
  return response?.data ?? []
}

export async function getCompany(id: number | string): Promise<Company> {
  return apiClient<Company>(`/api/companies/${id}/`)
}

export async function createCompany(data: Omit<Company, "id" | "created_at" | "updated_at">): Promise<Company> {
  return apiClient<Company>("/api/companies/", {
    method: "POST",
    body: data,
  })
}

export async function updateCompany(data: Partial<Company>): Promise<Company> {
  return apiClient<Company>("/api/companies/", {
    method: "PATCH",
    body: data,
  })
}
