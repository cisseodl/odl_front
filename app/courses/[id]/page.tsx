import { notFound } from "next/navigation"
import { mockCourses } from "@/lib/data"
import { CourseDetailClient } from "@/components/course-detail-client"

interface CoursePageProps {
  params: Promise<{ id: string }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params
  const course = mockCourses.find((c) => c.id === id)

  if (!course) {
    notFound()
  }

  return <CourseDetailClient course={course} />
}
