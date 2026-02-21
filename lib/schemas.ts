import { z } from "zod"

// ==========================================
// Auth Schemas
// ==========================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>

// ==========================================
// Student Registration Schemas
// ==========================================

export const basicInfoSchema = z.object({
  reg_no: z.string().max(10).optional().or(z.literal("")),
  first_name: z.string().min(1, "First name is required").max(255),
  last_name: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Valid email required"),
  phone_number: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  nationality: z.string().optional().or(z.literal("")),
  category: z.enum(["sc", "st", "gen", "obc"], {
    required_error: "Please select a category",
  }),
})

export const familyDetailsSchema = z.object({
  father_name: z.string().max(255).optional().or(z.literal("")),
  mother_name: z.string().max(255).optional().or(z.literal("")),
  father_occupation: z.string().max(255).optional().or(z.literal("")),
  mother_occupation: z.string().max(255).optional().or(z.literal("")),
  father_phone: z.string().max(15).optional().or(z.literal("")),
  mother_phone: z.string().max(15).optional().or(z.literal("")),
})

export const academicRecordSchema = z.object({
  level: z.enum(
    ["secondary", "sen_secondary", "diploma", "graduation", "post_graduation", "other"],
    { required_error: "Select education level" }
  ),
  stream: z.string().min(1, "Stream is required").max(255),
  branch: z.enum(["CSE", "IT", "ECE", "MECH"]).optional().nullable(),
  institute: z.string().min(1, "Institute is required").max(255),
  board: z.string().min(1, "Board/University is required").max(255),
  year: z.string().min(1, "Year is required").max(10),
  mark_type: z.enum(["percentage", "cgpa"], {
    required_error: "Select marks type",
  }),
  marks: z.coerce.number().min(0, "Marks must be positive"),
  study_gap: z.coerce.number().int().optional(),
  backlogs: z.coerce.number().int().optional().nullable(),
})

export const languageSchema = z.object({
  name: z.string().min(1, "Language name is required").max(255),
  speak: z.boolean().optional().default(false),
  write: z.boolean().optional().default(false),
  read: z.boolean().optional().default(false),
})

export const codePracticeSchema = z.object({
  platform_name: z.string().min(1, "Platform name is required").max(255),
  url: z.string().url("Enter a valid URL").max(200),
})

export const professionalLinksSchema = z.object({
  linkedin: z.string().url("Enter a valid URL").max(200).optional().or(z.literal("")),
  code_practice_links: z.array(codePracticeSchema).optional().default([]),
})

export const studentRegistrationSchema = z.object({
  basic_info: basicInfoSchema,
  family_details: familyDetailsSchema.optional(),
  academic_records: z.array(academicRecordSchema).min(1, "At least one academic record is required"),
  languages: z.array(languageSchema).optional().default([]),
  professional_links: professionalLinksSchema.optional(),
  is_placed: z.boolean().optional().default(false),
  placed_company: z.string().max(255).optional().or(z.literal("")),
  package: z.coerce.number().int().optional().nullable(),
})

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>
export type FamilyDetailsFormValues = z.infer<typeof familyDetailsSchema>
export type AcademicRecordFormValues = z.infer<typeof academicRecordSchema>
export type StudentRegistrationFormValues = z.infer<typeof studentRegistrationSchema>

// ==========================================
// Company / Job Schemas
// ==========================================

export const companySchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(255),
  company_code: z.string().min(1, "Company code is required").max(100),
  domain: z.string().min(1, "Domain is required").max(255),
})

export type CompanyFormValues = z.infer<typeof companySchema>

export const eligibilityCriteriaSchema = z.object({
  min_cgpa: z.coerce.number().min(0).max(10),
  allowed_branches: z.array(z.string()).min(1, "Select at least one branch"),
  max_backlogs: z.coerce.number().int().min(0),
  batch_start: z.coerce.number().int(),
  batch_end: z.coerce.number().int(),
})

export const requiredSkillSchema = z.object({
  skill_id: z.coerce.number().int(),
  minimum_skill_score: z.coerce.number().int().min(0).max(100),
})

export const packageDetailsSchema = z.object({
  ctc: z.coerce.number().min(0),
  job_type: z.enum(["full_time", "internship", "contract"]),
})

export const jobSchema = z.object({
  company_id: z.coerce.number().int(),
  job_role: z.string().min(1, "Job role is required"),
  education_level: z.enum(["graduation", "post_graduation", "diploma"]),
  eligibility_criteria: eligibilityCriteriaSchema,
  required_skills: z.array(requiredSkillSchema).optional().default([]),
  selection_process: z.array(z.string()).optional().default([]),
  package_details: packageDetailsSchema,
  job_location: z.string().min(1, "Location is required"),
  last_date_to_apply: z.string().min(1, "Deadline is required"),
  is_active: z.boolean().optional().default(true),
})

export type JobFormValues = z.infer<typeof jobSchema>
