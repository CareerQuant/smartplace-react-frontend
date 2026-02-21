"use client"

import { useEffect, useState } from "react"
import { getStudents } from "@/lib/api/student"
import { getCompanies } from "@/lib/api/companies"
import { getJobs } from "@/lib/api/jobs"
import type { Student, Company, Job } from "@/lib/types"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Building2, Briefcase, CheckCircle } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

export default function ExecutiveDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, c, j] = await Promise.all([
          getStudents().catch(() => []),
          getCompanies().catch(() => []),
          getJobs().catch(() => []),
        ])
        setStudents(s)
        setCompanies(c)
        setJobs(j)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    )
  }

  const placedCount = students.filter((s) => s.is_placed).length
  const unplacedCount = students.length - placedCount
  const activeJobs = jobs.filter((j) => j.is_active !== false).length

  const pieData = [
    { name: "Placed", value: placedCount },
    { name: "Not Placed", value: unplacedCount },
  ]
  const COLORS = ["var(--color-primary)", "var(--color-muted)"]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Executive Dashboard</h1>
        <p className="text-sm text-muted-foreground">Placement overview and management</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={students.length} icon={Users} />
        <StatCard title="Placed" value={placedCount} icon={CheckCircle} />
        <StatCard title="Companies" value={companies.length} icon={Building2} />
        <StatCard title="Active Jobs" value={activeJobs} icon={Briefcase} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Placement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No student data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{job.job_role}</p>
                  <p className="text-xs text-muted-foreground">Company #{job.company_id}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {job.package_details.ctc} LPA
                </span>
              </div>
            ))}
            {jobs.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
