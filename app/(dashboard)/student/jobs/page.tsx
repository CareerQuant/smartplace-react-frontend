"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getJobs } from "@/lib/api/jobs"
import type { Job } from "@/lib/types"
import { JobCard } from "@/components/job-card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

export default function StudentJobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")

  useEffect(() => {
    async function load() {
      try {
        const data = await getJobs()
        setJobs(data)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = jobs
    .filter((j) => j.is_active !== false)
    .filter((j) => {
      if (search) {
        const q = search.toLowerCase()
        return (
          j.job_role.toLowerCase().includes(q) ||
          j.job_location.toLowerCase().includes(q) ||
          (j.company_name || "").toLowerCase().includes(q)
        )
      }
      return true
    })
    .filter((j) => {
      if (jobTypeFilter === "all") return true
      return j.package_details.job_type === jobTypeFilter
    })

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Job Listings</h1>
        <p className="text-sm text-muted-foreground">Browse available placement opportunities</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by role, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full_time">Full Time</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border p-8">
          <p className="text-sm text-muted-foreground">No jobs match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => router.push(`/student/jobs/${job.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
