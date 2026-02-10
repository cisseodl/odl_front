/**
 * Configuration de l'API backend
 * L'URL de base doit être configurée via la variable d'environnement NEXT_PUBLIC_API_FRONT
 * Cette variable est configurée dans Amplify pour permettre la communication avec le backend
 * 
 * Note: Le backend utilise le context path /awsodclearning
 * Si le reverse proxy ne gère pas le routing, il faut l'inclure dans la base URL
 */
const getBaseURL = (): string => {
  const envURL = process.env.NEXT_PUBLIC_API_FRONT
  if (envURL) {
    // Nettoyer l'URL (enlever les slashes finaux)
    const cleanURL = envURL.trim().replace(/\/+$/, '')
    // Si l'URL d'environnement ne contient pas déjà le context path, l'ajouter
    if (!cleanURL.includes('/awsodclearning')) {
      return `${cleanURL}/awsodclearning`
    }
    return cleanURL
  }
  // URL par défaut avec context path
  return "https://api.smart-odc.com/awsodclearning"
}

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 30000,
} as const

/**
 * Endpoints de l'API
 */
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    signin: "/auth/signin",
    signup: "/auth/signup",
    changePassword: "/auth/change-pass",
    forgotPassword: "/auth/forget-pass",
    checkAvailability: "/auth/check-availability",
    createLearner: "/auth/create-learner",
  },
  // Courses
  courses: {
    getAll: "/courses/read",
    getById: "/courses/read",
    getByCategory: "/courses/read/by-category",
    getByPage: "/courses/page",
    enroll: "/courses/enroll",
    addReview: "/api/reviews/add", // Endpoint pour ajouter un avis
    getReviewsByCourse: "/api/reviews/course", // Endpoint pour récupérer les avis d'un cours
    save: "/courses/save",
    update: "/courses/update",
    delete: "/courses/delete",
  },
  // Review
  reviews: {
    getByCourse: "/api/reviews/course",
    add: "/api/reviews/add",
  },
  categories: {
    getAll: "/api/categories/read",
    getById: "/api/categories/read",
    save: "/categorie/save",
    update: "/categorie/update",
    delete: "/categorie/delete",
  },
  // Modules (remplace chapters)
  modules: {
    getByCourse: "/modules/course",
    save: "/modules/save",
  },
  // Quiz
  quiz: {
    getByCourse: "/quiz/course",
    getById: "/quiz",
    create: "/quiz/create",
    update: "/quiz/update",
    delete: "/quiz/delete",
    submit: "/quiz/submit",
  },
  // Labs
  labs: {
    getAll: "/api/labs/",
    getMySessions: "/api/labs/my-sessions",
    start: "/api/labs/start",
    stop: "/api/labs/stop",
    submit: "/api/labs/submit",
    submitReport: "/api/labs/submit-report",
  },
  // Learner
  learner: {
    getCourseProgress: "/api/learn",
    completeLesson: "/api/learn",
    getRecentActivity: "/api/learn/recent-activity",
    getLearningProgress: "/api/learn/learning-progress",
    getUpcomingDeadlines: "/api/learn/upcoming-deadlines",
    getNextSteps: "/api/learn/next-steps",
  },
  // Details Course
  detailsCourse: {
    getMyCompletedCourses: "/details-course/my-completed-courses",
  },
  // Files
  files: {
    upload: "/api/files/upload",
    serve: "/api/files",
    download: "/downloads",
  },
  // Certificates
  certificates: {
    download: "/certificates/download",
    myCertificates: "/api/profile/me/certificates",
  },
  // Profile
  profile: {
    me: "/api/profile/me",
  },
  // Apprenants
  apprenants: {
    create: "/api/apprenants/create",
    getAll: "/api/apprenants/get-all",
    getById: "/api/apprenants",
    update: "/api/apprenants",
    delete: "/api/apprenants",
    getByCohorte: "/api/apprenants/get-by-cohorte",
  },
  // Cohortes
  cohortes: {
    getAll: "/cohorte/read",
    getById: "/cohorte/read",
  },
  // Dashboard
  dashboard: {
    student: "/api/dashboard/student",
    instructor: "/api/dashboard/instructor",
    publicStats: "/api/dashboard/public-stats",
  },
  // Contact
  contact: {
    send: "/contact/send",
  },
  // Rubriques (Piliers)
  rubriques: {
    getAll: "/api/v1/rubriques/read",
    getById: "/api/v1/rubriques/read",
  },
  // ODC Formations
  odcFormations: {
    getAll: "/api/odc-formations/read",
    getById: "/api/odc-formations",
    create: "/api/odc-formations",
    update: "/api/odc-formations",
    delete: "/api/odc-formations",
  },
  // Testimonials
  testimonials: {
    getAll: "/api/testimonials",
    save: "/api/testimonials", // for POST
  },
  // Evaluations (Exams)
  evaluations: {
    getAll: "/api/evaluations/get-all",
    getByCourse: "/api/evaluations/course",
    submit: "/api/evaluations/submit",
    submitSatisfaction: "/api/evaluations/attempts",
    getResults: "/api/evaluations/attempts",
  },
} as const






