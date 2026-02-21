"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { getCompanies, createCompany } from "@/lib/api/companies"
import type { Company } from "@/lib/types"
import { companySchema, type CompanyFormValues } from "@/lib/schemas"
import { ApiClientError, flattenErrors } from "@/lib/api/client"
import { DataTable, type Column } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(data: CompanyFormValues) {
    setSubmitting(true)
    try {
      await createCompany(data)
      toast.success("Company created")
      reset()
      setDialogOpen(false)
      loadCompanies()
    } catch (error) {
      if (error instanceof ApiClientError) {
        const flat = flattenErrors(error.errors)
        for (const [key, msg] of Object.entries(flat)) {
          setError(key as keyof CompanyFormValues, { message: msg })
        }
        toast.error(error.message || "Validation error")
      } else {
        toast.error("Failed to create company")
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

  const rows = companies.map((c) => ({
    id: c.id,
    company_name: c.company_name,
    company_code: c.company_code,
    domain: c.domain,
    created_at: c.created_at ? new Date(c.created_at).toLocaleDateString() : "-",
  }))

  const columns: Column<(typeof rows)[number]>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Company Name", accessorKey: "company_name" },
    { header: "Code", accessorKey: "company_code" },
    { header: "Domain", accessorKey: "domain" },
    { header: "Created", accessorKey: "created_at" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-sm text-muted-foreground">Manage all registered companies</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Company</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Company</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Company Name *</Label>
                <Input {...register("company_name")} />
                {errors.company_name && <p className="text-sm text-destructive">{errors.company_name.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label>Company Code *</Label>
                <Input {...register("company_code")} />
                {errors.company_code && <p className="text-sm text-destructive">{errors.company_code.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Label>Domain *</Label>
                <Input placeholder="e.g. Technology" {...register("domain")} />
                {errors.domain && <p className="text-sm text-destructive">{errors.domain.message}</p>}
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Company"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        searchKey={"company_name" as never}
        searchPlaceholder="Search companies..."
      />
    </div>
  )
}
