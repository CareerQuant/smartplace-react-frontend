"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { getStudents } from "@/lib/api/student"
import { getJob } from "@/lib/api/jobs"
import { getPrediction } from "@/lib/api/predictions"
import type { Job, PredictionResult } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, MapPin, Calendar, IndianRupee, TrendingUp } from "lucide-react"
import { getSkillsByIds } from "@/lib/api/skills"

const jobTypeLabels: Record<string, string> = {
  full_time: "Full Time",
  internship: "Internship",
  contract: "Contract",
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const jobId = Number(params.jobId)

  const [job, setJob] = useState<Job | null>(null)
  const [studentId, setStudentId] = useState<number | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [predicting, setPredicting] = useState(false)
  const [skillMap, setSkillMap] = useState<Record<number, string>>({})

  // useEffect(() => {
  //   async function load() {
  //     try {
  //       const [jobData, students] = await Promise.all([
  //         getJob(jobId),
  //         user ? getStudents(String(user.user_id)).catch(() => []) : [],
  //       ])
  //       setJob(jobData)
  //       if (students.length > 0) setStudentId(students[0].id!)
  //     } catch {
  //       toast.error("Failed to load job details")
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   load()
  // }, [jobId, user])
//   useEffect(() => {
//   async function load() {
//     try {
//       const jobData = await getJob(jobId)
//       setJob(jobData)

//       if (user?.user_id) {
//         const studentResponse = await getStudents(String(user.user_id))
//         const students = studentResponse?.data ?? []

//         if (Array.isArray(students) && students.length > 0) {
//           setStudentId(students[0].id)
//         }
//       }
//     } catch (error) {
//       console.error("Job detail error:", error)
//       toast.error("Failed to load job details")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (jobId && user) {
//     load()
//   }
// }, [jobId, user])
useEffect(() => {
  async function load() {
    try {
      const jobResponse = await getJob(jobId)
      // const jobData = jobResponse?.data?.[0]

      if (!jobResponse) {
        toast.error("Job not found")
        return
      }

      setJob(jobResponse)

      // 🔹 Extract skill IDs
      const skillIds =
        jobResponse.required_skills?.map((rs: any) => rs.skill_id) ?? []

      if (skillIds.length > 0) {
        const skills = await getSkillsByIds(skillIds)

        const map: Record<number, string> = {}
        skills.forEach((skill) => {
          map[skill.id] = skill.skill_name
        })

        setSkillMap(map)
      }

      // 🔹 Student fetch
      if (user?.user_id) {
        const studentResponse = await getStudents(String(user.user_id))
        const students = studentResponse?.data ?? []

        if (Array.isArray(students) && students.length > 0) {
          setStudentId(students[0].id)
        }
      }
    } catch (error) {
      console.error("Job detail error:", error)
      toast.error("Failed to load job details")
    } finally {
      setLoading(false)
    }
  }

  if (jobId && user) {
    load()
  }
}, [jobId, user])

  async function handlePredict() {
    // if (!studentId || !job?.id) return
    setPredicting(true)
    try {
      const result = await getPrediction({ student_id: studentId, job_id: job.id })
      setPrediction(result)
    } catch {
      toast.error("Failed to get prediction")
    } finally {
      setPredicting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!job) {
    return <p className="text-muted-foreground">Job not found.</p>
  }

  const deadline = new Date(job.last_date_to_apply)
  const isExpired = deadline < new Date()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push("/student/jobs")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Jobs
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-xl">{job.job_role}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {job.company_name || `Company #${job.company_id}`}
              </p>
            </div>
            <Badge variant={isExpired ? "destructive" : "default"}>
              {isExpired ? "Closed" : "Active"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <IndianRupee className="h-4 w-4" /> {job.package_details.ctc} LPA
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {job.job_location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Deadline: {deadline.toLocaleDateString()}
            </span>
            <Badge variant="secondary">{jobTypeLabels[job.package_details.job_type]}</Badge>
            <Badge variant="outline" className="capitalize">{job.education_level.replace("_", " ")}</Badge>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Eligibility Criteria</h3>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              <li>Minimum CGPA: {job.eligibility_criteria.min_cgpa}</li>
              <li>Branches: {job.eligibility_criteria.allowed_branches.join(", ")}</li>
              <li>Max Backlogs: {job.eligibility_criteria.max_backlogs}</li>
              <li>Batch: {job.eligibility_criteria.batch_start} - {job.eligibility_criteria.batch_end}</li>
            </ul>
          </div>

          {job.required_skills.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((rs, i) => (
                  // <Badge key={i} variant="outline">
                  //   Skill #{rs.skill_id} (Min: {rs.minimum_skill_score}%)
                  // </Badge>
                  <Badge key={i} variant="outline">
  {skillMap[rs.skill_id] || `Skill #${rs.skill_id}`} 
  {" "} (Min: {rs.minimum_skill_score}%)
</Badge>
                ))}
              </div>
            </div>
          )}

          {job.selection_process.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Selection Process</h3>
              <ol className="list-inside list-decimal text-sm text-muted-foreground">
                {job.selection_process.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Placement Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prediction ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary">
                <span className="text-2xl font-bold text-foreground">
                  {Math.round(prediction.probability)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your estimated chance of getting placed in this role
              </p>
              <Progress value={prediction.probability} className="h-3 max-w-sm" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Check your probability of getting placed in this role based on your profile and skills.
              </p>
              <Button onClick={handlePredict} >
              {/* <Button onClick={handlePredict} disabled={predicting || !studentId}> */}
                {predicting ? "Analyzing..." : "Check My Chances"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
