import { apiClient } from "./client"
import type { Question, TestPayload, TestResult } from "@/lib/types"

export async function getQuestions(skillId: number): Promise<Question[]> {
  return apiClient<Question[]>(
    `/api/assessment/questions/?skill_id=${skillId}`
  )
}

export async function submitTest(data: TestPayload): Promise<TestResult> {
  return apiClient<TestResult>("/api/assessment/tests/", {
    method: "POST",
    body: data,
  })
}
