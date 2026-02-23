"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { getJobs, createJob } from "@/lib/api/jobs"
import { getCompanies } from "@/lib/api/companies"
import { getExecSkills } from "@/lib/api/skills"
import type { Job, Company, SkillMaster } from "@/lib/types"
import { jobSchema, type JobFormValues } from "@/lib/schemas"
import { ApiClientError } from "@/lib/api/client"
import { DataTable, type Column } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"

const BRANCHES = ["CSE", "IT", "ECE", "MECH"]

export default function ExecutiveJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [skills, setSkills] = useState<SkillMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectionInput, setSelectionInput] = useState("")
  const router = useRouter()


  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      eligibility_criteria: {
        min_cgpa: 0,
        allowed_branches: [],
        max_backlogs: 0,
        batch_start: 2022,
        batch_end: 2026,
      },
      required_skills: [],
      selection_process: [],
      package_details: { ctc: 0, job_type: "full_time" },
      is_active: true,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = form

  const requiredSkillsFields = useFieldArray({ control, name: "required_skills" })

  const watchBranches = watch("eligibility_criteria.allowed_branches") ?? []
  const watchProcess = watch("selection_process") ?? []

  useEffect(() => {
    async function load() {
      try {
        const [j, c, s] = await Promise.all([
          getJobs().catch(() => []),
          getCompanies().catch(() => []),
          getExecSkills().catch(() => []),
        ])
        setJobs(j)
        setCompanies(c)
        setSkills(s)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function onSubmit(data: JobFormValues) {
    setSubmitting(true)
    try {
      await createJob(data as Job)
      toast.success("Job created")
      reset()
      setDialogOpen(false)
      const updated = await getJobs().catch(() => [])
      setJobs(updated)
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message || "Validation error")
      } else {
        toast.error("Failed to create job")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full Time",
    internship: "Internship",
    contract: "Contract",
  }

  const rows = jobs.map((j) => ({
    id: j.id,
    job_role: j.job_role,
    company_id: j.company_id,
    company_name: companies.find((c) => c.id === j.company_id)?.company_name || `#${j.company_id}`,
    location: j.job_location,
    ctc: j.package_details.ctc,
    type: jobTypeLabels[j.package_details.job_type],
    is_active: j.is_active,
    deadline: new Date(j.last_date_to_apply).toLocaleDateString(),
  }))

  type Row = (typeof rows)[number]

  const columns: Column<Row>[] = [
    { header: "Role", accessorKey: "job_role" },
    { header: "Company", accessorKey: "company_name" },
    { header: "Location", accessorKey: "location" },
    { header: "CTC (LPA)", accessorKey: "ctc" },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jobs</h1>
          <p className="text-sm text-muted-foreground">Manage placement opportunities</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Create Job</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>Create Job</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Company *</Label>
                  <Select onValueChange={(val) => setValue("company_id", Number(val))}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.company_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Job Role *</Label>
                  <Input {...register("job_role")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Education Level *</Label>
                  <Select onValueChange={(val) => setValue("education_level", val as never)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="graduation">Graduation</SelectItem>
                      <SelectItem value="post_graduation">Post Graduation</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Location *</Label>
                  <Input {...register("job_location")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>CTC (LPA) *</Label>
                  <Input type="number" step="0.1" {...register("package_details.ctc")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Job Type *</Label>
                  <Select onValueChange={(val) => setValue("package_details.job_type", val as never)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Deadline *</Label>
                  <Input type="datetime-local" {...register("last_date_to_apply")} />
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="mb-3 text-sm font-semibold text-foreground">Eligibility Criteria</p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Min CGPA</Label>
                    <Input type="number" step="0.1" {...register("eligibility_criteria.min_cgpa")} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Max Backlogs</Label>
                    <Input type="number" {...register("eligibility_criteria.max_backlogs")} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Batch Start</Label>
                    <Input type="number" {...register("eligibility_criteria.batch_start")} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Batch End</Label>
                    <Input type="number" {...register("eligibility_criteria.batch_end")} />
                  </div>
                </div>
                <div className="mt-3">
                  <Label className="text-xs">Allowed Branches</Label>
                  <div className="mt-1 flex flex-wrap gap-3">
                    {BRANCHES.map((branch) => (
                      <label key={branch} className="flex items-center gap-1.5 text-sm">
                        <Checkbox
                          checked={watchBranches.includes(branch)}
                          onCheckedChange={(checked) => {
                            const updated = checked
                              ? [...watchBranches, branch]
                              : watchBranches.filter((b: string) => b !== branch)
                            setValue("eligibility_criteria.allowed_branches", updated)
                          }}
                        />
                        {branch}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Required Skills</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => requiredSkillsFields.append({ skill_id: 0, minimum_skill_score: 50 })}>
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
                {requiredSkillsFields.fields.map((field, index) => (
                  <div key={field.id} className="mb-2 flex items-center gap-2">
                    <Select onValueChange={(val) => setValue(`required_skills.${index}.skill_id`, Number(val))}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Select skill" /></SelectTrigger>
                      <SelectContent>
                        {skills.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.skill_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Min %" className="w-24" {...register(`required_skills.${index}.minimum_skill_score`)} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => requiredSkillsFields.remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-sm font-semibold text-foreground">Selection Process</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Online Test"
                    value={selectionInput}
                    onChange={(e) => setSelectionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (selectionInput.trim()) {
                          setValue("selection_process", [...watchProcess, selectionInput.trim()])
                          setSelectionInput("")
                        }
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    if (selectionInput.trim()) {
                      setValue("selection_process", [...watchProcess, selectionInput.trim()])
                      setSelectionInput("")
                    }
                  }}>Add</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {watchProcess.map((step: string, i: number) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {step}
                      <button type="button" onClick={() => setValue("selection_process", watchProcess.filter((_: string, idx: number) => idx !== i))} className="ml-1 text-xs hover:text-destructive">&times;</button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Job"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        searchKey={"job_role" as never}
        searchPlaceholder="Search jobs..."
        onRowClick={(row) => {
    router.push(`/executive/jobs/${row.id}`)
  }}
      />
    </div>
  )
}
