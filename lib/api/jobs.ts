import { apiClient } from "./client"
import type { Job } from "@/lib/types"

// export async function getJobs(companyId?: number): Promise<Job[]> {
//   const params = companyId ? `?company_id=${companyId}` : ""
//   return apiClient<Job[]>(`/api/companies/jobs/${params}`)
// }
export async function getJobs(): Promise<Job[]> {
  const response = await apiClient<any>("/api/companies/jobs/")
  return response.data ?? []
}

// export async function getJob(jobId: number | string): Promise<Job> {
//   return apiClient<Job>(`/api/companies/jobs/?job_id=${jobId}/`)
// }
export async function getJob(jobId: number | string): Promise<Job | null> {
  const response = await apiClient<any>(
    `/api/companies/jobs/?job_id=${jobId}`
  )

  const jobs = response?.data ?? []

  return Array.isArray(jobs) && jobs.length > 0 ? jobs[0] : null
}

export async function createJob(data: Omit<Job, "id">): Promise<Job> {
  return apiClient<Job>("/api/companies/jobs/", {
    method: "POST",
    body: data,
  })
}

export async function updateJob(data: Partial<Job>): Promise<Job> {
  return apiClient<Job>("/api/companies/jobs/", {
    method: "PATCH",
    body: data,
  })
}
