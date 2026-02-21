// ==========================================
// Auth Types
// ==========================================

export interface User {
  id: number
  email: string
  email_verified: boolean
  role: "student" | "executive" | "admin"
  last_password_update: string | null
  created_at: string
  updated_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user?: User
}

export interface LogoutPayload {
  refresh_token: string
}

export interface TokenRefreshPayload {
  refresh: string
}

export interface TokenRefreshResponse {
  access: string
  refresh: string
}

export interface RegisterPayload {
  email: string
  password: string
}

// ==========================================
// Student Types
// ==========================================

export interface BasicInfo {
  id?: number
  reg_no?: string | null
  placement_id?: string | null
  first_name: string
  last_name: string
  email: string
  phone_number: string
  dob: string
  gender: "male" | "female" | "other"
  nationality?: string
  category: "sc" | "st" | "gen" | "obc"
}

export interface FamilyDetails {
  id?: number
  father_name?: string | null
  mother_name?: string | null
  father_occupation?: string | null
  mother_occupation?: string | null
  father_phone?: string | null
  mother_phone?: string | null
}

export type AcademicLevel =
  | "secondary"
  | "sen_secondary"
  | "diploma"
  | "graduation"
  | "post_graduation"
  | "other"

export type Branch = "CSE" | "IT" | "ECE" | "MECH"

export interface AcademicRecord {
  id?: number
  level: AcademicLevel
  stream: string
  branch?: Branch | null
  institute: string
  board: string
  year: string
  mark_type: "percentage" | "cgpa"
  marks: number
  study_gap?: number
  backlogs?: number | null
}

export interface Language {
  id?: number
  name: string
  speak?: boolean
  write?: boolean
  read?: boolean
}

export interface CodePractice {
  id?: number
  platform_name: string
  url: string
}

export interface ProfessionalLink {
  id?: number
  code_practice_links?: CodePractice[]
  linkedin?: string | null
}

export interface Student {
  id?: number
  basic_info: BasicInfo
  family_details?: FamilyDetails
  academic_records: AcademicRecord[]
  languages?: Language[]
  professional_links?: ProfessionalLink
  is_placed?: boolean
  placed_company?: string | null
  package?: number | null
  created_at?: string
  updated_at?: string
  user: number
}

// ==========================================
// Company Types
// ==========================================

export interface Company {
  id?: number
  company_name: string
  company_code: string
  domain: string
  created_at?: string
  updated_at?: string
}

// ==========================================
// Job Types
// ==========================================

export interface EligibilityCriteria {
  min_cgpa: number
  allowed_branches: string[]
  max_backlogs: number
  batch_start: number
  batch_end: number
}

export interface RequiredSkill {
  skill_id: number
  minimum_skill_score: number
}

export interface PackageDetails {
  ctc: number
  job_type: "full_time" | "internship" | "contract"
}

export interface Job {
  id?: number
  company_id: number
  company_name?: string
  job_role: string
  education_level: "graduation" | "post_graduation" | "diploma"
  eligibility_criteria: EligibilityCriteria
  required_skills: RequiredSkill[]
  selection_process: string[]
  package_details: PackageDetails
  job_location: string
  last_date_to_apply: string
  is_active?: boolean
}

// ==========================================
// Skill Types
// ==========================================

export interface SkillMaster {
  id: number
  code: string
  skill_name: string
  domain: string
  created_at?: string
}

export interface SkillVerification {
  id?: number
  skill_code: string
  skill_id: number
  skill_name?: string
  domain?: string
  difficulty?: "easy" | "medium" | "hard"
  is_verified?: boolean
  best_score?: number | null
  latest_score?: number | null
  attempt_count?: number
  last_attempted_at?: string | null
}

export interface UserSkillPayload {
  student_id: number
  skills: SkillVerification[]
}

// ==========================================
// Assessment Types
// ==========================================

export interface Question {
  id: number
  skill: number
  question_text: string
  option1: string
  option2: string
  option3: string
  option4: string
  difficulty?: "easy" | "medium" | "hard"
  is_active?: boolean
}

export interface TestQuestion {
  question_id: number
  selected_option: string
}

export interface TestPayload {
  student_id: number
  skill_id: number
  questions: TestQuestion[]
}

export interface TestResult {
  student_id: number
  skill_id: number
  questions: TestQuestion[]
  total_questions: number
  correct_answers: number
  score: number
  attempt_number: number
}

// ==========================================
// Prediction Types
// ==========================================

export interface PredictionPayload {
  student_id: number
  job_id: number
}

export interface PredictionResult {
  student_id: number
  job_id: number
  probability: number
  created_at: string
}

// ==========================================
// API Types
// ==========================================

export interface ApiError {
  detail?: string
  message?: string
  [key: string]: unknown
}

export interface DecodedToken {
  user_id: number
  email: string
  role: "student" | "executive" | "admin"
  exp: number
  iat: number
}
