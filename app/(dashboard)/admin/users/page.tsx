"use client"

import { useEffect, useState } from "react"
import { getUsers } from "@/lib/api/auth"
import type { User } from "@/lib/types"
import { DataTable, type Column } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getUsers()
        setUsers(data)
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

  const rows = users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    email_verified: u.email_verified,
    created_at: u.created_at ? new Date(u.created_at).toLocaleDateString() : "-",
  }))

  type Row = (typeof rows)[number]

  const columns: Column<Row>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Role",
      cell: (row: Row) => (
        <Badge variant="outline" className="capitalize">
          {row.role}
        </Badge>
      ),
    },
    {
      header: "Verified",
      cell: (row: Row) => (
        <Badge variant={row.email_verified ? "default" : "secondary"}>
          {row.email_verified ? "Yes" : "No"}
        </Badge>
      ),
    },
    { header: "Created", accessorKey: "created_at" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">View and manage all system users</p>
      </div>
      <DataTable
        columns={columns as Column<Record<string, unknown>>[]}
        data={rows as unknown as Record<string, unknown>[]}
        searchKey={"email" as never}
        searchPlaceholder="Search users by email..."
      />
    </div>
  )
}
