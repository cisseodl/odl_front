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
export interface BackendCourse {
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
}





