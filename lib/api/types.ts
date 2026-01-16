/**
 * Types correspondant aux modèles du backend
 * Basés sur la documentation Swagger
 */

// ============ Authentication ============
export interface SigninRequest {
  email: string
  password: string
}

export interface JwtAuthenticationResponse {
  token: string
  user: BackendUser
}

// ============ User ============
export interface BackendUser {
  id: number
  fullName: string
  email: string
  phone?: string
  admin?: boolean
  activate?: boolean
  avatar?: string
  learner?: Apprenant
  role?: "USER" | "LEARNER" | "ADMIN" | "SUPERADMIN"
  enabled?: boolean
  username?: string
  authorities?: Array<{ authority: string }>
  accountNonExpired?: boolean
  accountNonLocked?: boolean
  credentialsNonExpired?: boolean
}

export interface Apprenant {
  id: number
  nom: string
  prenom: string
  email: string
  numero: string
  profession?: string
  niveauEtude?: string
  filiere?: string
  cohorte?: Cohorte
  createdBy?: string
  lastModifiedBy?: string
  activate?: boolean
  createdAt?: string
  lastModifiedAt?: string
  attentes?: string
  satisfaction?: boolean
}

// Request pour créer un apprenant
export interface ApprenantCreateRequest {
  activate?: boolean
  username: string // Remplace nom et prenom - format: "Prénom Nom"
  numero: string
  profession?: string
  niveauEtude?: string
  filiere?: string
  attentes?: string
  satisfaction?: boolean
  cohorteId?: number
  userId?: number
  userEmail?: string
}

export interface Cohorte {
  id: number
  nom: string
  description?: string
  dateDebut?: string
  dateFin?: string
  createdBy?: string
  lastModifiedBy?: string
  activate?: boolean
  createdAt?: string
  lastModifiedAt?: string
}

// ============ Courses ============
// CourseDto du backend - structure exacte retournée par l'API
export interface BackendCourse {
  id: number
  title: string
  subtitle: string
  description: string
  imageUrl: string // ⚠️ Note: backend retourne imageUrl, pas imagePath
  instructor?: InstructorDto
  category: string // Nom de la catégorie (string, pas objet)
  level: "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE" // Enum backend
  rating: number
  reviewCount: number
  duration: string // Format: "23h 45min"
  language: string
  lastUpdated: string // Format: "13 janvier 2026"
  bestseller: boolean
  objectives: string[] // Set<String> converti en array
  features: string[] // Set<String> converti en array
  curriculum?: ModuleDto[] // List<ModuleDto>
  enrolledCount: number
  status?: "BROUILLON" | "EN_ATTENTE" | "PUBLIE" | "REJETE"
  rejectionReason?: string
}

// InstructorDto du backend
export interface InstructorDto {
  id: number
  name: string
  avatar?: string
  title?: string
  bio?: string
  studentCount: number
  courseCount: number
  rating: number
}

// ModuleDto du backend
export interface ModuleDto {
  id: number
  title: string
  duration: string // Format: "1h 30m"
  lessons?: LessonDto[]
}

// LessonDto du backend
export interface LessonDto {
  id: number
  title: string
  type: "VIDEO" | "QUIZ" | "DOCUMENT" | "LAB" // Enum LessonType
  duration: string // Format: "15 min"
  completed?: boolean
  locked?: boolean
}

// Ancienne interface (conservée pour compatibilité si nécessaire)
export interface BackendCourseLegacy {
  id: number
  title: string
  description: string
  imagePath?: string
  duration?: number // en minutes
  courseType?: "REGISTER" | "LINK" | "PDF"
  categorie?: BackendCategorie
  createdBy?: string
  lastModifiedBy?: string
  activate?: boolean
  createdAt?: string
  lastModifiedAt?: string
}

export interface BackendCategorie {
  id: number
  title: string
  description?: string
  createdBy?: string
  lastModifiedBy?: string
  activate?: boolean
  createdAt?: string
  lastModifiedAt?: string
}

// ============ Chapters ============
export interface BackendChapter {
  id: number
  title: string
  description?: string
  courseId?: number
  pdfPath?: string
  order?: number
  createdBy?: string
  lastModifiedBy?: string
  activate?: boolean
  createdAt?: string
  lastModifiedAt?: string
}

// ============ Quiz ============
export interface QuizDTO {
  id: number
  titre: string
  description?: string
  courseId: number
  dureeMinutes?: number
  scoreMinimum?: number
  questions?: QuestionDTO[]
}

export interface QuestionDTO {
  id: number
  contenu: string
  type: "QCM" | "TEXTE"
  points?: number
  reponses?: ReponseDTO[]
}

export interface ReponseDTO {
  id: number
  texte: string
  estCorrecte: boolean
}

export interface QuizSubmissionDTO {
  quizId: number
  answers: AnswerDTO[]
}

export interface AnswerDTO {
  questionId: number
  reponseIds?: number[]
  texteReponse?: string
}

// ============ Labs ============
export interface LabDefinition {
  id: number
  title: string
  description?: string
  dockerImageName?: string
  instructions?: string
  estimatedDurationMinutes?: number
  createdBy?: string
  lastModifiedBy?: string
  activate?: boolean
  createdAt?: string
  lastModifiedAt?: string
}

export interface LabSession {
  id: number
  user?: BackendUser
  labDefinition?: LabDefinition
  status?: "STARTING" | "RUNNING" | "STOPPED" | "SUBMITTED"
  containerUrl?: string
  startTime?: string
  endTime?: string
  grade?: string
  reportUrl?: string
  createdBy?: string
  lastModifiedBy?: string
  activate?: boolean
  createdAt?: string
  lastModifiedAt?: string
}

export interface SubmitLabRequest {
  reportUrl: string
}

// ============ Dashboard ============
export interface DashboardStatsDTO {
  coursesJoined?: number
  certificatesObtained?: number
  averageScore?: number
  totalQuizAttempts?: number
  totalUsers?: number
  totalCourses?: number
  totalQuizAttemptsGlobal?: number
  totalCertificatesGlobal?: number
  mode?: string
  adminStats?: {
    totalUsers?: number
    totalCourses?: number
    publishedCourses?: number
    totalEnrollments?: number
    top5CoursesByEnrollment?: Record<string, number>
  }
}

// Statistiques publiques pour la page d'accueil
export interface PublicStats {
  totalStudents: number
  totalCourses: number
  mostViewedCourses: number
  satisfactionRate: number
}

// ============ Profile ============
export interface ProfileDto {
  id: number
  fullName: string
  email: string
  avatar?: string
  enrolledCourses: string[]
  completedCourses: string[]
  certificates: string[]
}

export interface CertificateDto {
  id: number
  uniqueCode: string
  studentName: string
  studentEmail: string
  course: string
  courseId: number
  issuedDate: string
  validUntil: string
  status: string
  certificateUrl: string
  avatar?: string
}

// ============ Course Progress ============
export interface CourseProgressDto {
  courseId: number
  courseTitle: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  lessons: LessonProgressDto[]
}

export interface LessonProgressDto {
  lessonId: number
  lessonTitle: string
  lessonType: string
  lessonDuration: string
  completed: boolean
  completedAt?: string
}
