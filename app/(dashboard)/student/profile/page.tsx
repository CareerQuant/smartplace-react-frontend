"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getStudents } from "@/lib/api/student"
import type { Student } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const response = await getStudents(String(user.user_id))

        const students = response.data ?? []

        if (students.length > 0) {
          setStudent(students[0])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!student) {
    return <p className="text-muted-foreground">No profile found.</p>
  }

  const { basic_info, family_details, academic_records, languages, professional_links } = student

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">Your registered profile information</p>
        <div className="flex justify-end">
          <button onClick={() => router.push("/student/register?edit=true")}>
            Edit Profile
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {basic_info.reg_no && (
              <>
                <dt className="font-medium text-muted-foreground">Reg No</dt>
                <dd className="text-foreground sm:col-span-1 lg:col-span-2">{basic_info.reg_no}</dd>
              </>
            )}
            <dt className="font-medium text-muted-foreground">Name</dt>
            <dd className="text-foreground sm:col-span-1 lg:col-span-2">{basic_info.first_name} {basic_info.last_name}</dd>
            <dt className="font-medium text-muted-foreground">Email</dt>
            <dd className="text-foreground sm:col-span-1 lg:col-span-2">{basic_info.email}</dd>
            <dt className="font-medium text-muted-foreground">Phone</dt>
            <dd className="text-foreground sm:col-span-1 lg:col-span-2">{basic_info.phone_number}</dd>
            <dt className="font-medium text-muted-foreground">DOB</dt>
            <dd className="text-foreground sm:col-span-1 lg:col-span-2">{basic_info.dob}</dd>
            <dt className="font-medium text-muted-foreground">Gender</dt>
            <dd className="capitalize text-foreground sm:col-span-1 lg:col-span-2">{basic_info.gender}</dd>
            <dt className="font-medium text-muted-foreground">Category</dt>
            <dd className="uppercase text-foreground sm:col-span-1 lg:col-span-2">{basic_info.category}</dd>
          </dl>
        </CardContent>
      </Card>

      {family_details && (
        <Card>
          <CardHeader><CardTitle>Family Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {family_details.father_name && (
                <><dt className="font-medium text-muted-foreground">{"Father's Name"}</dt><dd className="text-foreground">{family_details.father_name}</dd></>
              )}
              {family_details.mother_name && (
                <><dt className="font-medium text-muted-foreground">{"Mother's Name"}</dt><dd className="text-foreground">{family_details.mother_name}</dd></>
              )}
              {family_details.father_occupation && (
                <><dt className="font-medium text-muted-foreground">{"Father's Occupation"}</dt><dd className="text-foreground">{family_details.father_occupation}</dd></>
              )}
              {family_details.mother_occupation && (
                <><dt className="font-medium text-muted-foreground">{"Mother's Occupation"}</dt><dd className="text-foreground">{family_details.mother_occupation}</dd></>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {academic_records && academic_records.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Academic Records</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {academic_records.map((rec, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium capitalize text-foreground">
                    {rec.level.replace("_", " ")} - {rec.stream}
                  </p>
                  {rec.branch && <Badge variant="secondary">{rec.branch}</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {rec.institute} ({rec.board}) - {rec.year}
                </p>
                <p className="text-sm text-muted-foreground">
                  {rec.marks} ({rec.mark_type})
                  {rec.backlogs ? ` | ${rec.backlogs} backlogs` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {languages && languages.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Languages</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {languages.map((lang, i) => (
              <Badge key={i} variant="outline">
                {lang.name}
                {lang.speak && " (Speak)"}
                {lang.write && " (Write)"}
                {lang.read && " (Read)"}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {professional_links && (
        <Card>
          <CardHeader><CardTitle>Professional Links</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {professional_links.linkedin && (
              <p>
                <span className="font-medium text-muted-foreground">LinkedIn: </span>
                <a href={professional_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {professional_links.linkedin}
                </a>
              </p>
            )}
            {professional_links.code_practice_links?.map((link, i) => (
              <p key={i}>
                <span className="font-medium text-muted-foreground">{link.platform_name}: </span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {link.url}
                </a>
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Placement Status</CardTitle></CardHeader>
        <CardContent>
          <Badge variant={student.is_placed ? "default" : "secondary"}>
            {student.is_placed ? `Placed at ${student.placed_company}` : "Not Yet Placed"}
          </Badge>
          {student.is_placed && student.package && (
            <p className="mt-2 text-sm text-muted-foreground">Package: {student.package} LPA</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
