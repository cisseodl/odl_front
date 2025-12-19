"use client"

import { use } from "react"
import { LabClient } from "@/components/lab-client"
import { ProtectedRoute } from "@/components/protected-route"

interface LabPageProps {
  params: Promise<{
    courseId: string
    labId: string
  }>
}

export default function LabPage({ params }: LabPageProps) {
  const { courseId, labId } = use(params)

  return (
    <ProtectedRoute>
      <LabClient courseId={courseId} labId={labId} />
    </ProtectedRoute>
  )
}
