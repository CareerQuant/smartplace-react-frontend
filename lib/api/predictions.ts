import { apiClient } from "./client"
import type { PredictionPayload, PredictionResult } from "@/lib/types"

// export async function getPrediction(
//   data: PredictionPayload
// ): Promise<PredictionResult> {
//   return apiClient<PredictionResult>("/api/predictions/", {
//     method: "POST",
//     body: data,
//   })
// }

export async function getPrediction(
  data: PredictionPayload
): Promise<PredictionResult> {
  const response = await apiClient<any>("/api/predictions/", {
    method: "POST",
    body: data,
  })

  return response?.data
}