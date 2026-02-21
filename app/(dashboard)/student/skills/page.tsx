"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { getStudents } from "@/lib/api/student"
import { getSkills, getStudentSkills, addStudentSkills } from "@/lib/api/skills"
import type { SkillMaster, SkillVerification } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Award, Play, Plus } from "lucide-react"

export default function StudentSkillsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [studentId, setStudentId] = useState<number | null>(null)
  const [allSkills, setAllSkills] = useState<SkillMaster[]>([])
  const [mySkills, setMySkills] = useState<SkillVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [addingSkills, setAddingSkills] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const studentResponse = await getStudents(String(user.user_id))
const students = studentResponse.data ?? []

if (students.length > 0) {
  const sid = students[0].id!
  setStudentId(sid)

  const [skillsResponse, studentSkillsResponse] = await Promise.all([
    getSkills().catch(() => null),
    getStudentSkills(sid).catch(() => null),
  ])

  const skills = skillsResponse?.data ?? []
  const studentSkills = studentSkillsResponse?.data ?? []

  setAllSkills(skills)
  setMySkills(studentSkills)
}
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const mySkillIds = new Set(mySkills.map((s) => s.id))
  const availableSkills = allSkills.filter((s) => !mySkillIds.has(s.id))

  async function refreshStudentSkills() {
  if (!studentId) return

  try {
    const res = await getStudentSkills(studentId)
    setMySkills(res?.data ?? [])
  } catch {
    toast.error("Failed to refresh skills")
  }
}
  async function handleAddSkills() {
    if (!studentId || selectedSkills.length === 0) return
    setAddingSkills(true)
    try {
      const skillsPayload = selectedSkills.map((skillId) => {
        const skill = allSkills.find((s) => s.id === skillId)!
        return { skill_code: skill.code, skill_id: skill.id }
      })
      // const updated = await addStudentSkills({
        // student_id: studentId,
        // skills: skillsPayload as SkillVerification[],
      // })
      const response = await addStudentSkills({
        student_id: studentId,
        skills: skillsPayload as SkillVerification[],
      })
      await refreshStudentSkills()      // setMySkills(updated)
      setSelectedSkills([])
      setDialogOpen(false)
      toast.success("Skills added successfully")
    } catch {
      toast.error("Failed to add skills")
    } finally {
      setAddingSkills(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Skills</h1>
          <p className="text-sm text-muted-foreground">Manage and verify your technical skills</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Skills
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Skills</DialogTitle>
            </DialogHeader>
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {availableSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">All available skills have been added.</p>
              ) : (
                availableSkills.map((skill) => (
                  <label key={skill.id} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                    <Checkbox
                      checked={selectedSkills.includes(skill.id)}
                      onCheckedChange={(checked) => {
                        setSelectedSkills((prev) =>
                          checked
                            ? [...prev, skill.id]
                            : prev.filter((id) => id !== skill.id)
                        )
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{skill.skill_name}</p>
                      <p className="text-xs text-muted-foreground">{skill.domain}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
            {availableSkills.length > 0 && (
              <Button onClick={handleAddSkills} disabled={addingSkills || selectedSkills.length === 0}>
                {addingSkills ? "Adding..." : `Add ${selectedSkills.length} Skill(s)`}
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {mySkills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-8">
            <Award className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No skills added yet. Add skills to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mySkills.map((skill) => (
            <Card key={skill.id ?? skill.skill_id}>
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div>
                  <CardTitle className="text-base">{skill.skill_name || skill.skill_code}</CardTitle>
                  <p className="text-xs text-muted-foreground">{skill.domain}</p>
                </div>
                <Badge variant={skill.is_verified ? "default" : "outline"}>
                  {skill.is_verified ? "Verified" : "Unverified"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground">Best</p>
                    <p className="font-semibold text-foreground">{skill.best_score ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Latest</p>
                    <p className="font-semibold text-foreground">{skill.latest_score ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Attempts</p>
                    <p className="font-semibold text-foreground">{skill.attempt_count ?? 0}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/student/skills/${skill.skill_id}/test`)}
                >
                  <Play className="mr-1 h-4 w-4" /> Take Test
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
