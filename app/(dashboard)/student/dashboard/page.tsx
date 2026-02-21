"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getStudents } from "@/lib/api/student"
import { getStudentSkills } from "@/lib/api/skills"
import { getJobs } from "@/lib/api/jobs"
import type { Student, SkillVerification, Job } from "@/lib/types"
import { StatCard } from "@/components/stat-card"
import { JobCard } from "@/components/job-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, CheckCircle, Briefcase, TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [skills, setSkills] = useState<SkillVerification[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   async function load() {
  //     if (!user) return
  //     try {
  //       const students = await getStudents(String(user.user_id))
  //       if (students.length > 0) {
  //         setStudent(students[0])
  //         const studentId = students[0].id!
  //         const [skillsData, jobsData] = await Promise.all([
  //           getStudentSkills(studentId).catch(() => []),
  //           getJobs().catch(() => []),
  //         ])
  //         setSkills(skillsData)
  //         setJobs(jobsData.filter((j) => j.is_active !== false).slice(0, 6))
  //       } else {
  //         router.replace("/student/register")
  //       }
  //     } catch {
  //       router.replace("/student/register")
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   load()
  // }, [user, router])
  useEffect(() => {
    if (!user?.user_id) return

    const userId = user.user_id

    async function load() {
      try {
        const response = await getStudents(String(userId))

        // 🔥 Extract real array from response
        const students = response.data ?? []

        if (students.length > 0) {
          setStudent(students[0])

          const studentId = students[0].id!

          const [skillsResponse, jobsResponse] = await Promise.all([
            getStudentSkills(studentId).catch(() => null),
            getJobs().catch(() => null),
          ])

          const skillsData = skillsResponse?.data ?? []
          const jobsData = jobsResponse?.data ?? []

          setSkills(skillsData)
          setJobs(jobsData.filter((j: any) => j.is_active !== false).slice(0, 6))
        } else {
          router.replace("/student/register")
        }
      } catch (error) {
        console.error("Dashboard error:", error)
        router.replace("/student/register")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (!student) return null

  const totalSkills = skills.length
  const verifiedSkills = skills.filter((s) => s.is_verified).length
  const avgScore =
    skills.length > 0
      ? Math.round(
        skills.reduce((sum, s) => sum + (s.best_score ?? 0), 0) / skills.length
      )
      : 0

  const chartData = skills.slice(0, 8).map((s) => ({
    name: s.skill_name || s.skill_code,
    score: s.best_score ?? 0,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {student.basic_info.first_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {"Here's an overview of your placement journey"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Skills" value={totalSkills} icon={Award} />
        <StatCard title="Verified" value={verifiedSkills} icon={CheckCircle} />
        <StatCard title="Avg Score" value={`${avgScore}%`} icon={TrendingUp} />
        <StatCard
          title="Status"
          value={student.is_placed ? "Placed" : "Active"}
          icon={Briefcase}
          description={student.is_placed ? student.placed_company ?? undefined : undefined}
        />
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-foreground)",
                  }}
                />
                <Bar dataKey="score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Jobs</h2>
          <Button variant="outline" size="sm" onClick={() => router.push("/student/jobs")}>
            View All
          </Button>
        </div>
        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => router.push(`/student/jobs/${job.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">No active jobs available right now.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
