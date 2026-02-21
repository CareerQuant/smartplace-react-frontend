"use client"

import { useEffect, useState } from "react"
import { getESStudents } from "@/lib/api/student"
import type { Student } from "@/lib/types"
import { DataTable, type Column } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExecutiveStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getESStudents()
        setStudents(data)
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

  const rows = students.map((s) => {
    const gradRecord = s.academic_records?.find(
      (r) => r.level === "graduation" || r.level === "post_graduation"
    )
    return {
      id: s.id,
      name: `${s.basic_info.first_name} ${s.basic_info.last_name}`,
      email: s.basic_info.email,
      branch: gradRecord?.branch ?? "-",
      marks: gradRecord ? `${gradRecord.marks} (${gradRecord.mark_type})` : "-",
      is_placed: s.is_placed,
      placed_company: s.placed_company,
    }
  })

  type Row = (typeof rows)[number]

  const columns: Column<Row>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "Branch", accessorKey: "branch" },
    { header: "Marks", accessorKey: "marks" },
    {
      header: "Status",
      cell: (row: Row) => (
        <Badge variant={row.is_placed ? "default" : "secondary"}>
          {row.is_placed ? "Placed" : "Active"}
        </Badge>
      ),
    },
    {
      header: "Company",
      cell: (row: Row) => (
        <span className="text-sm text-muted-foreground">
          {row.placed_company || "-"}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="text-sm text-muted-foreground">View and manage registered students</p>
      </div>
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        searchKey={"name" as never}
        searchPlaceholder="Search students..."
      />
    </div>
  )
}
