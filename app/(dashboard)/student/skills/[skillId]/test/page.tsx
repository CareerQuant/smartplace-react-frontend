"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { getStudents } from "@/lib/api/student"
import { getQuestions, submitTest } from "@/lib/api/assessment"
import type { Question, TestResult } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"

export default function SkillTestPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const skillId = Number(params.skillId)

  const [studentId, setStudentId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const studentResponse = await getStudents(String(user.user_id))
        const students = studentResponse?.data ?? []

        if (students.length > 0) {
          setStudentId(students[0].id!)
        }
        const qsResponse = await getQuestions(skillId)
        const qs = qsResponse?.data ?? []
        setQuestions(Array.isArray(qs) ? qs : [])
      } catch {
        toast.error("Failed to load questions")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, skillId])

  async function handleSubmit() {
    if (!studentId) return
    const answersCount = Object.keys(answers).length
    if (answersCount !== questions.length) {
    toast.error("Please answer all questions before submitting.")
    return
  }

    setSubmitting(true)
    try {
      const testResult = await submitTest({
        student_id: studentId,
        skill_id: skillId,
        questions: Object.entries(answers).map(([qId, option]) => ({
          question_id: Number(qId),
          selected_option: option,
        })),
      })
      setResult(testResult)
      toast.success("Test submitted successfully!")
    } catch {
      toast.error("Failed to submit test")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
      </div>
    )
  }

  if (result) {
    const percentage = Math.round(result.data.score)
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push("/student/skills")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Skills
        </Button>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Test Results</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary">
              <span className="text-3xl font-bold text-foreground">{percentage}%</span>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">{result.total_questions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Correct</p>
                <p className="text-xl font-bold text-primary">{result.correct_answers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attempt</p>
                <p className="text-xl font-bold text-foreground">#{result.attempt_number}</p>
              </div>
            </div>
            <Badge variant={percentage >= 60 ? "default" : "secondary"} className="text-base px-4 py-1">
              {percentage >= 60 ? "Passed" : "Needs Improvement"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skill Assessment</h1>
          <p className="text-sm text-muted-foreground">
            {answeredCount} of {questions.length} questions answered
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={submitting || answeredCount !== questions.length}
        >
          {submitting ? "Submitting..." : "Submit Test"}
        </Button>
      </div>

      <Progress value={progress} className="h-2" />

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">No questions available for this skill yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {questions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <CardTitle className="text-base font-medium leading-relaxed">
                    {q.question_text}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <RadioGroup
                  value={answers[q.id] || ""}
                  onValueChange={(val) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: val }))
                  }
                >
                  {[
                    { key: "option1", value: q.option1 },
                    { key: "option2", value: q.option2 },
                    { key: "option3", value: q.option3 },
                    { key: "option4", value: q.option4 },
                  ].map((opt) => (
                    <div key={opt.key} className="flex items-center gap-2 py-1.5">
                      <RadioGroupItem value={opt.key} id={`${q.id}-${opt.key}`} />
                      <Label htmlFor={`${q.id}-${opt.key}`} className="cursor-pointer text-sm">
                        {opt.value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
