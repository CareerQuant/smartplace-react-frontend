import { apiClient } from "./client"
import type { SkillMaster, SkillVerification, UserSkillPayload } from "@/lib/types"

export async function getSkills(): Promise<SkillMaster[]> {
  return apiClient<SkillMaster[]>("/api/skills/")
}
// export async function getExecSkills(): Promise<SkillMaster[]> {
//   const response = await apiClient<any>("/api/skills/")
//   return response.data ?? []
// }
export async function getExecSkills(): Promise<SkillMaster[]> {
  const res = await apiClient<any>("/api/skills/")
  return res.data
}
// export async function getSkills(): Promise<SkillMaster[]> {
//   const response = await apiClient<any>("/api/skills/")
//   return Array.isArray(response?.data) ? response.data : []
// }
export async function getStudentSkills(studentId: number): Promise<SkillVerification[]> {
  return apiClient<SkillVerification[]>(
    `/api/skills/student-skills/?student_id=${studentId}`
  )
}

export async function addStudentSkills(
  data: UserSkillPayload
): Promise<SkillVerification[]> {
  return apiClient<SkillVerification[]>("/api/skills/student-skills/", {
    method: "POST",
    body: data,
  })
}

export async function updateStudentSkills(
  data: UserSkillPayload
): Promise<SkillVerification[]> {
  return apiClient<SkillVerification[]>("/api/skills/student-skills/", {
    method: "PATCH",
    body: data,
  })
}

export async function getSkillsByIds(ids: number[]): Promise<SkillMaster[]> {
  if (!ids.length) return []

  const query = ids.join(",")
  const response = await apiClient<{ data: SkillMaster[] }>(
    `/api/skills/?ids=${query}`
  )

  return response?.data ?? []
}