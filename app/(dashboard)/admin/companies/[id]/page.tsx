"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getCompany } from "@/lib/api/companies"
import { getJobs } from "@/lib/api/jobs"
import type { Company, Job } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, MapPin, IndianRupee, Calendar } from "lucide-react"

const jobTypeLabels: Record<string, string> = {
  full_time: "Full Time",
  internship: "Internship",
  contract: "Contract",
}

export default function AdminCompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = Number(params.id)

  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [c, j] = await Promise.all([
          getCompany(companyId),
          getJobs(companyId).catch(() => []),
        ])
        setCompany(c)
        setJobs(j)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [companyId])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!company) {
    return <p className="text-muted-foreground">Company not found.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push("/admin/companies")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Companies
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{company.company_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <dt className="font-medium text-muted-foreground">Code</dt>
            <dd className="text-foreground">{company.company_code}</dd>
            <dt className="font-medium text-muted-foreground">Domain</dt>
            <dd className="text-foreground">{company.domain}</dd>
            <dt className="font-medium text-muted-foreground">Created</dt>
            <dd className="text-foreground">{company.created_at ? new Date(company.created_at).toLocaleDateString() : "-"}</dd>
          </dl>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Jobs ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">No jobs posted by this company.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{job.job_role}</CardTitle>
                    <Badge variant={job.is_active ? "default" : "secondary"}>
                      {job.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {job.package_details.ctc} LPA</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.job_location}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(job.last_date_to_apply).toLocaleDateString()}</span>
                  <Badge variant="outline">{jobTypeLabels[job.package_details.job_type]}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
