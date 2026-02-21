"use client"

import { useEffect, useState } from "react"
import { getUsers } from "@/lib/api/auth"
import { getStudents } from "@/lib/api/student"
import { getCompanies } from "@/lib/api/companies"
import { getJobs } from "@/lib/api/jobs"
import type { User, Student, Company, Job } from "@/lib/types"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, GraduationCap, Building2, Briefcase } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [u, s, c, j] = await Promise.all([
          getUsers().catch(() => []),
          getStudents().catch(() => []),
          getCompanies().catch(() => []),
          getJobs().catch(() => []),
        ])
        setUsers(u)
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

  const studentUsers = users.filter((u) => u.role === "student").length
  const executiveUsers = users.filter((u) => u.role === "executive").length
  const adminUsers = users.filter((u) => u.role === "admin").length

  const roleData = [
    { role: "Students", count: studentUsers },
    { role: "Executives", count: executiveUsers },
    { role: "Admins", count: adminUsers },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={users.length} icon={Users} />
        <StatCard title="Students" value={students.length} icon={GraduationCap} />
        <StatCard title="Companies" value={companies.length} icon={Building2} />
        <StatCard title="Jobs" value={jobs.length} icon={Briefcase} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="role" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-foreground)",
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {users.slice(0, 6).map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.email}</p>
                  <p className="text-xs capitalize text-muted-foreground">{u.role}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}
                </span>
              </div>
            ))}
            {users.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No users found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
