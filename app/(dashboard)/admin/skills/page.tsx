"use client"

import { useEffect, useState } from "react"
import { getExecSkills } from "@/lib/api/skills"
import type { SkillMaster } from "@/lib/types"
import { DataTable, type Column } from "@/components/data-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillMaster[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getExecSkills()
        setSkills(data)
      } catch {
        // silent
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

  const rows = skills.map((s) => ({
    id: s.id,
    code: s.code,
    skill_name: s.skill_name,
    domain: s.domain,
    created_at: s.created_at ? new Date(s.created_at).toLocaleDateString() : "-",
  }))

  const columns: Column<(typeof rows)[number]>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Code", accessorKey: "code" },
    { header: "Skill Name", accessorKey: "skill_name" },
    { header: "Domain", accessorKey: "domain" },
    { header: "Created", accessorKey: "created_at" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Skills Master</h1>
        <p className="text-sm text-muted-foreground">View all registered skill categories</p>
      </div>
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        searchKey={"skill_name" as never}
        searchPlaceholder="Search skills..."
      />
    </div>
  )
}
