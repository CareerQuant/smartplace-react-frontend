"use client"

// import { useState } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useSearchParams } from "next/navigation"

// import { createStudent } from "@/lib/api/student"
import { createStudent, getStudentById, updateStudent } from "@/lib/api/student"
import {
  studentRegistrationSchema,
  type StudentRegistrationFormValues,
} from "@/lib/schemas"

import { ApiClientError, flattenErrors } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, CheckCircle } from "lucide-react"

const STEPS = [
  "Basic Info",
  "Family",
  "Academics",
  "Languages & Links",
  "Placement",
  "Review",
]

export function StudentRegistrationForm() {
  const [isExistingProfile, setIsExistingProfile] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("0")
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get("edit") === "true"

  useEffect(() => {
    if (!user?.user_id) return

    const fetchStudent = async () => {
      try {
        const response = await getStudentById(String(user.user_id))

        // 🔥 Your student is inside response.data[0]
        const student = response.data?.[0]

        if (student) {
          setIsExistingProfile(true)

          form.reset({
            basic_info: {
              ...student.basic_info,
            },
            family_details: {
              ...student.family_details,
            },
            academic_records: student.academic_records ?? [],
            languages: student.languages ?? [],
            professional_links: {
              linkedin: student.professional_links?.linkedin ?? "",
              code_practice_links:
                student.professional_links?.code_practice_links ?? [],
            },
            is_placed: student.is_placed,
            placed_company: student.placed_company,
            package: student.package,
          })
        }
      } catch (error) {
        setIsExistingProfile(false)
      }
    }

    fetchStudent()
  }, [user])

  const form = useForm<StudentRegistrationFormValues>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      basic_info: {
        reg_no: "",
        first_name: "",
        last_name: "",
        email: user?.email ?? "",
        phone_number: "",
        dob: "",
        gender: undefined,
        nationality: "",
        category: undefined,
      },
      family_details: {
        father_name: "",
        mother_name: "",
        father_occupation: "",
        mother_occupation: "",
        father_phone: "",
        mother_phone: "",
      },
      academic_records: [
        {
          level: undefined,
          stream: "",
          branch: null,
          institute: "",
          board: "",
          year: "",
          mark_type: undefined,
          marks: 0,
          study_gap: 0,
          backlogs: null,
        },
      ],
      languages: [],
      professional_links: {
        linkedin: "",
        code_practice_links: [],
      },
      is_placed: false,
      placed_company: "",
      package: null,
    },
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = form

  const academicFields = useFieldArray({ control, name: "academic_records" })
  const languageFields = useFieldArray({ control, name: "languages" })
  const codePracticeFields = useFieldArray({
    control,
    name: "professional_links.code_practice_links",
  })

  const isPlaced = watch("is_placed")

  function goNext() {
    const next = Math.min(parseInt(activeTab) + 1, STEPS.length - 1)
    setActiveTab(String(next))
  }

  function goBack() {
    const prev = Math.max(parseInt(activeTab) - 1, 0)
    setActiveTab(String(prev))
  }

  async function onSubmit(data: StudentRegistrationFormValues) {
    if (!user) return
    setIsSubmitting(true)

    try {
      const payload: StudentRegistrationFormValues & { user: number } = {
        ...data,
        basic_info: {
          ...data.basic_info,
          nationality: data.basic_info.nationality || "Indian",
        },
        user: user.user_id,
      }

      if (isExistingProfile) {
        await updateStudent(String(user.user_id), payload)
        toast.success("Profile updated successfully!")
      } else {
        // await createStudent(payload)
        if (isEditMode) {
  await updateStudent(user.user_id, data)
  toast.success("Profile updated successfully!")
} else {
  await createStudent({
    ...data,
    user: user.user_id,
  })
  toast.success("Profile created successfully!")
}
        toast.success("Profile created successfully!")
      }
      router.push("/student/dashboard")
    } catch (error) {
      if (error instanceof ApiClientError) {
        const flat = flattenErrors(error.errors)
        for (const [key, msg] of Object.entries(flat)) {
          setError(key as keyof StudentRegistrationFormValues, { message: msg })
        }
        toast.error(error.message || "Validation error. Please check the form.")
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchedValues = watch()

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-1">
          {STEPS.map((step, i) => (
            <TabsTrigger key={i} value={String(i)} className="text-xs md:text-sm">
              {step}
            </TabsTrigger>
          ))}
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 0: Basic Info */}
          <TabsContent value="0">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg_no">Registration No (optional)</Label>
                  <Input id="reg_no" {...register("basic_info.reg_no")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input id="first_name" {...register("basic_info.first_name")} />
                  {errors.basic_info?.first_name && (
                    <p className="text-sm text-destructive">{errors.basic_info.first_name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input id="last_name" {...register("basic_info.last_name")} />
                  {errors.basic_info?.last_name && (
                    <p className="text-sm text-destructive">{errors.basic_info.last_name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register("basic_info.email")} />
                  {errors.basic_info?.email && (
                    <p className="text-sm text-destructive">{errors.basic_info.email.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" {...register("basic_info.phone_number")} />
                  {errors.basic_info?.phone_number && (
                    <p className="text-sm text-destructive">{errors.basic_info.phone_number.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input id="dob" type="date" {...register("basic_info.dob")} />
                  {errors.basic_info?.dob && (
                    <p className="text-sm text-destructive">{errors.basic_info.dob.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Gender *</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("basic_info.gender", val as "male" | "female" | "other")
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.basic_info?.gender && (
                    <p className="text-sm text-destructive">{errors.basic_info.gender.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" placeholder="Indian" {...register("basic_info.nationality")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Category *</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("basic_info.category", val as "sc" | "st" | "gen" | "obc")
                    }
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gen">General</SelectItem>
                      <SelectItem value="obc">OBC</SelectItem>
                      <SelectItem value="sc">SC</SelectItem>
                      <SelectItem value="st">ST</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.basic_info?.category && (
                    <p className="text-sm text-destructive">{errors.basic_info.category.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={goNext}>Next</Button>
            </div>
          </TabsContent>

          {/* Step 1: Family */}
          <TabsContent value="1">
            <Card>
              <CardHeader>
                <CardTitle>Family Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>{"Father's Name"}</Label>
                  <Input {...register("family_details.father_name")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{"Mother's Name"}</Label>
                  <Input {...register("family_details.mother_name")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{"Father's Occupation"}</Label>
                  <Input {...register("family_details.father_occupation")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{"Mother's Occupation"}</Label>
                  <Input {...register("family_details.mother_occupation")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{"Father's Phone"}</Label>
                  <Input {...register("family_details.father_phone")} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{"Mother's Phone"}</Label>
                  <Input {...register("family_details.mother_phone")} />
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={goBack}>Back</Button>
              <Button type="button" onClick={goNext}>Next</Button>
            </div>
          </TabsContent>

          {/* Step 2: Academics */}
          <TabsContent value="2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Academic Records</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    academicFields.append({
                      level: "graduation",
                      stream: "",
                      branch: null,
                      institute: "",
                      board: "",
                      year: "",
                      mark_type: "percentage",
                      marks: 0,
                      study_gap: 0,
                      backlogs: null,
                    })
                  }
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Record
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {academicFields.fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Record {index + 1}</p>
                      {academicFields.fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => academicFields.remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="flex flex-col gap-2">
                        <Label>Level *</Label>
                        <Select
                          onValueChange={(val) =>
                            setValue(`academic_records.${index}.level`, val as never)
                          }
                        >
                          <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="secondary">Secondary (10th)</SelectItem>
                            <SelectItem value="sen_secondary">Sr. Secondary (12th)</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="graduation">Graduation</SelectItem>
                            <SelectItem value="post_graduation">Post Graduation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Stream *</Label>
                        <Input {...register(`academic_records.${index}.stream`)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Branch</Label>
                        <Select
                          onValueChange={(val) =>
                            setValue(`academic_records.${index}.branch`, val as never)
                          }
                        >
                          <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CSE">CSE</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="ECE">ECE</SelectItem>
                            <SelectItem value="MECH">MECH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Institute *</Label>
                        <Input {...register(`academic_records.${index}.institute`)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Board/University *</Label>
                        <Input {...register(`academic_records.${index}.board`)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Year *</Label>
                        <Input {...register(`academic_records.${index}.year`)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Marks Type *</Label>
                        <Select
                          onValueChange={(val) =>
                            setValue(`academic_records.${index}.mark_type`, val as never)
                          }
                        >
                          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="cgpa">CGPA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Marks *</Label>
                        <Input type="number" step="0.01" {...register(`academic_records.${index}.marks`)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Backlogs</Label>
                        <Input type="number" {...register(`academic_records.${index}.backlogs`)} />
                      </div>
                    </div>
                    {errors.academic_records?.[index] && (
                      <p className="mt-2 text-sm text-destructive">
                        Please fill in all required fields for this record.
                      </p>
                    )}
                  </div>
                ))}
                {errors.academic_records?.message && (
                  <p className="text-sm text-destructive">{errors.academic_records.message}</p>
                )}
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={goBack}>Back</Button>
              <Button type="button" onClick={goNext}>Next</Button>
            </div>
          </TabsContent>

          {/* Step 3: Languages & Links */}
          <TabsContent value="3">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Languages</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      languageFields.append({ name: "", speak: false, write: false, read: false })
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Language
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {languageFields.fields.map((field, index) => (
                    <div key={field.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                      <Input
                        placeholder="Language name"
                        className="max-w-48"
                        {...register(`languages.${index}.name`)}
                      />
                      <label className="flex items-center gap-1.5 text-sm">
                        <input type="checkbox" {...register(`languages.${index}.speak`)} />
                        Speak
                      </label>
                      <label className="flex items-center gap-1.5 text-sm">
                        <input type="checkbox" {...register(`languages.${index}.write`)} />
                        Write
                      </label>
                      <label className="flex items-center gap-1.5 text-sm">
                        <input type="checkbox" {...register(`languages.${index}.read`)} />
                        Read
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => languageFields.remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {languageFields.fields.length === 0 && (
                    <p className="text-sm text-muted-foreground">No languages added yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Professional Links</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>LinkedIn URL</Label>
                    <Input placeholder="https://linkedin.com/in/..." {...register("professional_links.linkedin")} />
                    {errors.professional_links?.linkedin && (
                      <p className="text-sm text-destructive">{errors.professional_links.linkedin.message}</p>
                    )}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Coding Profiles</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        codePracticeFields.append({ platform_name: "", url: "" })
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" /> Add Profile
                    </Button>
                  </div>
                  {codePracticeFields.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <Input
                        placeholder="Platform (e.g. LeetCode)"
                        className="max-w-48"
                        {...register(`professional_links.code_practice_links.${index}.platform_name`)}
                      />
                      <Input
                        placeholder="Profile URL"
                        {...register(`professional_links.code_practice_links.${index}.url`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => codePracticeFields.remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={goBack}>Back</Button>
              <Button type="button" onClick={goNext}>Next</Button>
            </div>
          </TabsContent>

          {/* Step 4: Placement */}
          <TabsContent value="4">
            <Card>
              <CardHeader>
                <CardTitle>Placement Information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={isPlaced}
                    onCheckedChange={(checked) => setValue("is_placed", checked)}
                  />
                  <Label>Already Placed?</Label>
                </div>
                {isPlaced && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label>Company Name</Label>
                      <Input {...register("placed_company")} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Package (LPA)</Label>
                      <Input type="number" {...register("package")} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={goBack}>Back</Button>
              <Button type="button" onClick={goNext}>Next</Button>
            </div>
          </TabsContent>

          {/* Step 5: Review */}
          <TabsContent value="5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Review Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Basic Info</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground">{watchedValues.basic_info?.first_name} {watchedValues.basic_info?.last_name}</span>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{watchedValues.basic_info?.email}</span>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{watchedValues.basic_info?.phone_number}</span>
                    <span className="text-muted-foreground">DOB:</span>
                    <span className="text-foreground">{watchedValues.basic_info?.dob}</span>
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="capitalize text-foreground">{watchedValues.basic_info?.gender}</span>
                    <span className="text-muted-foreground">Category:</span>
                    <span className="uppercase text-foreground">{watchedValues.basic_info?.category}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Academics</p>
                  {watchedValues.academic_records?.map((rec, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      {rec.level} - {rec.stream} at {rec.institute} ({rec.marks} {rec.mark_type})
                    </p>
                  ))}
                </div>

                <Separator />

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Placement</p>
                  <p className="text-sm text-muted-foreground">
                    {watchedValues.is_placed
                      ? `Placed at ${watchedValues.placed_company || "N/A"} - ${watchedValues.package || 0} LPA`
                      : "Not yet placed"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={goBack}>Back</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isExistingProfile
                    ? "Update Profile"
                    : "Create Profile"}
              </Button>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  )
}
