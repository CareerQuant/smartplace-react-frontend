"use client"

import { useEffect, useState } from "react"
import { getExecutiveStudents } from "@/lib/api/student"
import { getJobs } from "@/lib/api/jobs"
import { getCompanies } from "@/lib/api/companies"
import type { Student, Job, Company } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export default function ExecutiveStatsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, j, c] = await Promise.all([
          getExecutiveStudents().catch(() => []),
          getJobs().catch(() => []),
          getCompanies().catch(() => []),
        ])
        setStudents(s)
        setJobs(j)
        setCompanies(c)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72" />)}
        </div>
      </div>
    )
  }

  // Branch-wise placement
  const branchData: Record<string, { total: number; placed: number }> = {}
  students.forEach((s) => {
    const gradRecord = s.academic_records?.find(
      (r) => r.level === "graduation" || r.level === "post_graduation"
    )
    const branch = gradRecord?.branch || "Other"
    if (!branchData[branch]) branchData[branch] = { total: 0, placed: 0 }
    branchData[branch].total++
    if (s.is_placed) branchData[branch].placed++
  })

  const branchChartData = Object.entries(branchData).map(([branch, data]) => ({
    branch,
    total: data.total,
    placed: data.placed,
  }))

  // Package distribution
  const packageRanges = [
    { name: "0-5 LPA", min: 0, max: 5 },
    { name: "5-10 LPA", min: 5, max: 10 },
    { name: "10-15 LPA", min: 10, max: 15 },
    { name: "15-25 LPA", min: 15, max: 25 },
    { name: "25+ LPA", min: 25, max: Infinity },
  ]

  const packageData = packageRanges.map((range) => ({
    name: range.name,
    count: students.filter(
      (s) =>
        s.is_placed &&
        s.package != null &&
        s.package >= range.min &&
        s.package < range.max
    ).length,
  }))

  // Company hiring counts
  const companyHiring = companies.slice(0, 8).map((c) => ({
    name: c.company_name,
    jobs: jobs.filter((j) => j.company_id === c.id).length,
  }))

  // Job type distribution
  const jobTypes = {
    full_time: jobs.filter((j) => j.package_details.job_type === "full_time").length,
    internship: jobs.filter((j) => j.package_details.job_type === "internship").length,
    contract: jobs.filter((j) => j.package_details.job_type === "contract").length,
  }

  const jobTypePieData = [
    { name: "Full Time", value: jobTypes.full_time },
    { name: "Internship", value: jobTypes.internship },
    { name: "Contract", value: jobTypes.contract },
  ].filter((d) => d.value > 0)

  const COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Placement Statistics</h1>
        <p className="text-sm text-muted-foreground">Detailed analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Branch-wise Placement</CardTitle></CardHeader>
          <CardContent>
            {branchChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={branchChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="branch" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      color: "var(--color-foreground)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="var(--color-chart-3)" name="Total" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed" fill="var(--color-chart-1)" name="Placed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Job Type Distribution</CardTitle></CardHeader>
          <CardContent>
            {jobTypePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={jobTypePieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {jobTypePieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Package Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={packageData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-foreground)",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-chart-2)" name="Students" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Company Hiring Activity</CardTitle></CardHeader>
          <CardContent>
            {companyHiring.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={companyHiring} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      color: "var(--color-foreground)",
                    }}
                  />
                  <Bar dataKey="jobs" fill="var(--color-chart-4)" name="Jobs" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
