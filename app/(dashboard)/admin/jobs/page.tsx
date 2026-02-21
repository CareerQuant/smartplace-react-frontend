"use client"

import { useEffect, useState } from "react"
import { getJobs } from "@/lib/api/jobs"
import { getCompanies } from "@/lib/api/companies"
import type { Job, Company } from "@/lib/types"
import { DataTable, type Column } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const jobTypeLabels: Record<string, string> = {
  full_time: "Full Time",
  internship: "Internship",
  contract: "Contract",
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [j, c] = await Promise.all([
          getJobs().catch(() => []),
          getCompanies().catch(() => []),
        ])
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
        <Skeleton className="h-96" />
      </div>
    )
  }

  const rows = jobs.map((j) => ({
    id: j.id,
    job_role: j.job_role,
    company_name: companies.find((c) => c.id === j.company_id)?.company_name || `#${j.company_id}`,
    location: j.job_location,
    ctc: `${j.package_details.ctc} LPA`,
    type: jobTypeLabels[j.package_details.job_type],
    is_active: j.is_active,
    deadline: new Date(j.last_date_to_apply).toLocaleDateString(),
  }))

  type Row = (typeof rows)[number]

  const columns: Column<Row>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Role", accessorKey: "job_role" },
    { header: "Company", accessorKey: "company_name" },
    { header: "Location", accessorKey: "location" },
    { header: "CTC", accessorKey: "ctc" },
    { header: "Type", accessorKey: "type" },
    {
      header: "Status",
      cell: (row: Row) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    { header: "Deadline", accessorKey: "deadline" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">All Jobs</h1>
        <p className="text-sm text-muted-foreground">View and manage all job listings across companies</p>
      </div>
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        searchKey={"job_role" as never}
        searchPlaceholder="Search jobs..."
      />
    </div>
  )
}
