/**
 * Configuration de l'API backend
 * L'URL de base doit être configurée via la variable d'environnement NEXT_PUBLIC_API_FRONT
 * Cette variable est configurée dans Amplify pour permettre la communication avec le backend
 */
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_FRONT || "https://api.smart-odc.com/awsodclearning",
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
    save: "/courses/save",
    update: "/courses/update",
    delete: "/courses/delete",
  },
  // Categories
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
  },
  // Learner
  learner: {
    getCourseProgress: "/api/learn",
    completeLesson: "/api/learn",
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
  },
  // Contact
  contact: {
    send: "/contact/send",
  },
} as const






