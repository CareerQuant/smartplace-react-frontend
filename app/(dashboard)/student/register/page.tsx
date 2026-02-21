"use client"

import { StudentRegistrationForm } from "@/components/student-registration-form"

export default function StudentRegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details to start using the placement platform
        </p>
      </div>
      <StudentRegistrationForm />
    </div>
  )
}
