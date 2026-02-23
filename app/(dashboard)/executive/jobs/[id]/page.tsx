"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getJob } from "@/lib/api/jobs"
import { getStudents } from "@/lib/api/student"
import { getPrediction } from "@/lib/api/predictions"
import type { Job, Student, PredictionResult } from "@/lib/types"
import { DataTable, type Column } from "@/components/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type StudentPrediction = {
  student_id: number
  name: string
  cgpa: number
  probability: number
}

export default function JobDetailsPage() {
  const params = useParams()
  const jobId = Number(params.id)

  const [job, setJob] = useState<Job | null>(null)
  const [predictions, setPredictions] = useState<StudentPrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const jobData = await getJob(jobId)
        setJob(jobData)

        const studentResponse = await getStudents()
        const students: Student[] = studentResponse?.data ?? []

        // Run predictions in parallel
        const results = await Promise.all(
          students.map(async (student) => {
            try {
              const prediction: PredictionResult = await getPrediction({
                student_id: student.id!,
                job_id: jobId,
              })

              return {
                student_id: student.id!,
                name: student.basic_info.first_name,
                cgpa: student.academic_records[0].marks,
                probability: prediction.probability,
              }
            } catch {
              return null
            }
          })
        )

        // Remove failed predictions
        const validResults = results.filter(
          (r): r is StudentPrediction => r !== null
        )

        setPredictions(validResults)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) load()
  }, [jobId])

  if (loading) {
    return <Skeleton className="h-96" />
  }

  if (!job) return <p>Job not found</p>

  // Filter high probability students (>= 60%)
  const highProbability = predictions
    .filter((p) => p.probability >= 60)
    .sort((a, b) => b.probability - a.probability)

  const columns: Column<StudentPrediction>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "CGPA", accessorKey: "cgpa" },
    {
      header: "Probability (%)",
      cell: (row) => (
        <Badge variant="default">
          {Math.round(row.probability)}%
        </Badge>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Job Details */}
      <div className="rounded-lg border p-4">
        <h1 className="text-xl font-bold">{job.job_role}</h1>
        <p>Location: {job.job_location}</p>
        <p>CTC: {job.package_details.ctc} LPA</p>
        <p>
          Deadline:{" "}
          {new Date(job.last_date_to_apply).toLocaleDateString()}
        </p>
      </div>

      {/* High Probability Students */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">
          High Probability Candidates
        </h2>

        <DataTable
          columns={columns as Column<Record<string, unknown>>[]}
          data={highProbability as unknown as Record<string, unknown>[]}
        />
      </div>
    </div>
  )
}