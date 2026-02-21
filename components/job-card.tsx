import type { Job } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, IndianRupee } from "lucide-react"
import { cn } from "@/lib/utils"

interface JobCardProps {
  job: Job
  onClick?: () => void
  className?: string
}

const jobTypeLabels: Record<string, string> = {
  full_time: "Full Time",
  internship: "Internship",
  contract: "Contract",
}

export function JobCard({ job, onClick, className }: JobCardProps) {
  const deadline = new Date(job.last_date_to_apply)
  const isExpired = deadline < new Date()

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold leading-snug">
            {job.job_role}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {job.company_name || `Company #${job.company_id}`}
          </p>
        </div>
        <Badge variant={isExpired ? "destructive" : "secondary"} className="shrink-0">
          {isExpired ? "Closed" : jobTypeLabels[job.package_details.job_type]}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <IndianRupee className="h-3.5 w-3.5" />
          {job.package_details.ctc} LPA
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {job.job_location}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {deadline.toLocaleDateString()}
        </span>
      </CardContent>
    </Card>
  )
}
