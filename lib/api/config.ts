/**
 * Configuration de l'API backend
 */
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 
    "http://odc-learning-backend-env.eba-ruizssvt.us-east-1.elasticbeanstalk.com/awsodclearning",
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
    getAll: "/categorie/read",
    getById: "/categorie/read",
    save: "/categorie/save",
    update: "/categorie/update",
    delete: "/categorie/delete",
  },
  // Chapters
  chapters: {
    getByCourse: "/chapters/course",
    save: "/chapters/save",
  },
  // Quiz
  quiz: {
    getByCourse: "/quiz/course",
    create: "/quiz/create",
    submit: "/quiz/submit",
  },
  // Dashboard
  dashboard: {
    summary: "/dashboard/summary",
  },
  // Labs
  labs: {
    getAll: "/api/labs/",
    getMySessions: "/api/labs/my-sessions",
    start: "/api/labs/start",
    stop: "/api/labs/stop",
    submit: "/api/labs/submit",
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
  },
} as const




