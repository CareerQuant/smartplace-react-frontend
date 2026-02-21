"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getStudents } from "@/lib/api/student"

export default function HomePage() {
  const { isAuthenticated, isLoading, role, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    async function redirect() {
      if (role === "student" && user) {
        try {
          const students = await getStudents(String(user.user_id))
          if (students && students.length > 0) {
            router.replace("/student/dashboard")
          } else {
            router.replace("/student/register")
          }
        } catch {
          router.replace("/student/register")
        }
      } else if (role === "executive") {
        router.replace("/executive/dashboard")
      } else if (role === "admin") {
        router.replace("/admin/dashboard")
      }
    }

    redirect()
  }, [isAuthenticated, isLoading, role, user, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
