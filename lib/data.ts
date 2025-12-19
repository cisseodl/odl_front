// Static data that can be used in both Server and Client Components
import type { Course, Lab, Achievement } from "./types"

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "React & TypeScript - Le Guide Complet",
    subtitle: "Maîtrisez React 19 et TypeScript pour créer des applications web modernes",
    description:
      "Apprenez à construire des applications React professionnelles avec TypeScript. Ce cours couvre tous les concepts essentiels, des hooks aux patterns avancés.",
    imageUrl: "/react-typescript-coding-developer.jpg",
    instructor: {
      id: "inst-1",
      name: "Sophie Martin",
      avatar: "/female-developer-portrait.png",
      title: "Senior Frontend Developer",
      bio: "Développeuse frontend avec 10 ans d'expérience, spécialisée en React et TypeScript.",
      studentCount: 45000,
      courseCount: 8,
      rating: 4.9,
    },
    category: "Développement Web",
    level: "Intermédiaire",
    rating: 4.8,
    reviewCount: 3200,
    duration: "32.5",
    language: "Français",
    lastUpdated: "Mars 2024",
    bestseller: true,
    objectives: [
      "Maîtriser React 19 et ses nouveaux hooks",
      "Écrire du code TypeScript robuste",
      "Gérer l'état avec Zustand et React Query",
      "Créer des composants réutilisables",
      "Déployer sur Vercel",
    ],
    curriculum: [
      {
        id: "mod-1",
        title: "Introduction à React",
        duration: "3h",
        lessons: [
          { id: "l-1", title: "Installation et configuration", type: "video", duration: "15min" },
          { id: "l-2", title: "Premiers composants", type: "video", duration: "25min" },
          { id: "l-3", title: "Quiz de validation", type: "quiz", duration: "10min" },
        ],
      },
    ],
    enrolledCount: 12500,
    features: ["32.5 heures de vidéo", "12 ressources téléchargeables", "Accès illimité", "Certificat de fin"],
  },
  {
    id: "2",
    title: "Next.js 15 - Applications Full-Stack",
    subtitle: "Créez des applications web performantes avec Next.js et le App Router",
    description:
      "Découvrez Next.js 15, le framework React le plus populaire pour créer des applications web modernes et performantes.",
    imageUrl: "/next-js-web-development-laptop.jpg",
    instructor: {
      id: "inst-2",
      name: "Amadou Keita",
      avatar: "/male-developer-portrait.png",
      title: "Full-Stack Architect",
      bio: "Architecte logiciel passionné par Next.js et les technologies serverless.",
      studentCount: 32000,
      courseCount: 5,
      rating: 4.9,
    },
    category: "Développement Web",
    level: "Avancé",
    rating: 4.9,
    reviewCount: 2100,
    duration: "28",
    language: "Français",
    lastUpdated: "Avril 2024",
    bestseller: true,
    objectives: [
      "Maîtriser le App Router de Next.js 15",
      "Créer des API routes sécurisées",
      "Optimiser les performances",
      "Intégrer des bases de données",
    ],
    curriculum: [],
    enrolledCount: 8900,
    features: ["28 heures de vidéo", "15 projets pratiques", "Support instructeur", "Certificat"],
  },
  {
    id: "3",
    title: "UI/UX Design avec Figma",
    subtitle: "Devenez un designer professionnel et créez des interfaces magnifiques",
    description: "Apprenez à concevoir des interfaces utilisateur modernes et intuitives avec Figma.",
    imageUrl: "/ui-ux-design-figma-interface.jpg",
    instructor: {
      id: "inst-3",
      name: "Fatoumata Sangaré",
      avatar: "/female-designer-portrait.png",
      title: "Lead UX Designer",
      bio: "Designer UX/UI avec une passion pour créer des expériences utilisateur exceptionnelles.",
      studentCount: 28000,
      courseCount: 6,
      rating: 4.8,
    },
    category: "Design",
    level: "Débutant",
    rating: 4.7,
    reviewCount: 1800,
    duration: "24",
    language: "Français",
    lastUpdated: "Février 2024",
    bestseller: false,
    objectives: [
      "Maîtriser Figma de A à Z",
      "Créer des design systems",
      "Prototyper des applications",
      "Collaborer avec des développeurs",
    ],
    curriculum: [],
    enrolledCount: 6500,
    features: ["24 heures de vidéo", "20 fichiers Figma", "Templates inclus", "Certificat"],
  },
  {
    id: "4",
    title: "Python pour la Data Science",
    subtitle: "Analysez et visualisez des données avec Python, Pandas et Matplotlib",
    description: "Découvrez comment utiliser Python pour analyser, manipuler et visualiser des données.",
    imageUrl: "/python-data-science-charts-analytics.jpg",
    instructor: {
      id: "inst-4",
      name: "Moussa Diarra",
      avatar: "/male-data-scientist-portrait.jpg",
      title: "Data Scientist",
      bio: "Data scientist avec 8 ans d'expérience dans l'analyse de données et le machine learning.",
      studentCount: 38000,
      courseCount: 7,
      rating: 4.8,
    },
    category: "Data Science",
    level: "Intermédiaire",
    rating: 4.8,
    reviewCount: 2500,
    duration: "36",
    language: "Français",
    lastUpdated: "Mars 2024",
    bestseller: true,
    objectives: [
      "Maîtriser NumPy et Pandas",
      "Créer des visualisations avec Matplotlib",
      "Nettoyer et préparer des données",
      "Réaliser des analyses statistiques",
    ],
    curriculum: [],
    enrolledCount: 11200,
    features: ["36 heures de vidéo", "50 notebooks Jupyter", "Datasets réels", "Certificat"],
  },
  {
    id: "5",
    title: "DevOps avec Docker & Kubernetes",
    subtitle: "Containerisez et déployez vos applications en production",
    description: "Apprenez à containeriser vos applications et à les déployer avec Docker et Kubernetes.",
    imageUrl: "/devops-docker-kubernetes-containers.jpg",
    instructor: {
      id: "inst-5",
      name: "Boubacar Koné",
      avatar: "/male-devops-engineer-portrait.jpg",
      title: "DevOps Engineer",
      bio: "Ingénieur DevOps spécialisé dans l'automatisation et le déploiement continu.",
      studentCount: 22000,
      courseCount: 4,
      rating: 4.7,
    },
    category: "DevOps",
    level: "Avancé",
    rating: 4.7,
    reviewCount: 1200,
    duration: "30",
    language: "Français",
    lastUpdated: "Avril 2024",
    bestseller: false,
    objectives: [
      "Maîtriser Docker et Docker Compose",
      "Déployer avec Kubernetes",
      "Mettre en place CI/CD",
      "Monitorer vos applications",
    ],
    curriculum: [],
    enrolledCount: 5400,
    features: ["30 heures de vidéo", "10 labs pratiques", "Ressources DevOps", "Certificat"],
  },
  {
    id: "6",
    title: "Machine Learning avec TensorFlow",
    subtitle: "Créez des modèles d'IA et de deep learning performants",
    description: "Plongez dans le machine learning et créez vos propres modèles d'intelligence artificielle.",
    imageUrl: "/machine-learning-ai-neural-network.jpg",
    instructor: {
      id: "inst-6",
      name: "Aminata Coulibaly",
      avatar: "/female-ai-engineer-portrait.jpg",
      title: "ML Engineer",
      bio: "Ingénieure en machine learning passionnée par l'IA et le deep learning.",
      studentCount: 31000,
      courseCount: 6,
      rating: 4.9,
    },
    category: "Intelligence Artificielle",
    level: "Avancé",
    rating: 4.9,
    reviewCount: 1900,
    duration: "42",
    language: "Français",
    lastUpdated: "Mars 2024",
    bestseller: true,
    objectives: [
      "Comprendre les algorithmes de ML",
      "Créer des réseaux de neurones",
      "Utiliser TensorFlow et Keras",
      "Déployer des modèles en production",
    ],
    curriculum: [],
    enrolledCount: 9800,
    features: ["42 heures de vidéo", "30 projets ML", "GPUs cloud inclus", "Certificat"],
  },
  {
    id: "7",
    title: "AWS Cloud Practitioner Essentials",
    subtitle: "Les bases fondamentales du Cloud AWS pour débutants",
    description: "Apprenez les concepts de base du Cloud AWS, la sécurité, l'architecture et la facturation. Idéal pour préparer la certification CLF-C01.",
    imageUrl: "/aws-cloud-logo.jpg",
    instructor: {
      id: "inst-5",
      name: "Boubacar Koné",
      avatar: "/male-devops-engineer-portrait.jpg",
      title: "AWS Community Hero",
      bio: "Expert Cloud certifié avec une passion pour la pédagogie.",
      studentCount: 22000,
      courseCount: 5,
      rating: 4.8,
    },
    category: "Cloud Computing",
    level: "Débutant",
    rating: 4.9,
    reviewCount: 1500,
    duration: "12",
    language: "Français",
    lastUpdated: "Mai 2024",
    bestseller: true,
    objectives: [
      "Comprendre le Cloud Computing",
      "Services AWS principaux (EC2, S3, RDS)",
      "Sécurité et conformité AWS",
      "Modèles de facturation",
    ],
    curriculum: [],
    enrolledCount: 7800,
    features: ["12 heures de vidéo", "Quiz blancs", "Accès mobile", "Certificat"],
  },
  {
    id: "8",
    title: "Data Analysis avec PowerBI & SQL",
    subtitle: "Transformez des données brutes en insights exploitables",
    description: "Maîtrisez l'art de la visualisation de données avec Microsoft PowerBI et apprenez à requêter vos bases avec SQL.",
    imageUrl: "/data-analysis-powerbi-dashboard.jpg",
    instructor: {
      id: "inst-4",
      name: "Moussa Diarra",
      avatar: "/male-data-scientist-portrait.jpg",
      title: "Senior Data Analyst",
      bio: "Expert en Business Intelligence et Analytics.",
      studentCount: 38000,
      courseCount: 8,
      rating: 4.9,
    },
    category: "Data Science",
    level: "Intermédiaire",
    rating: 4.8,
    reviewCount: 3100,
    duration: "25",
    language: "Français",
    lastUpdated: "Avril 2024",
    bestseller: true,
    objectives: [
      "Connecter des sources de données",
      "Nettoyer et transformer les données",
      "Créer des rapports interactifs",
      "Requêtes SQL avancées",
    ],
    curriculum: [],
    enrolledCount: 9500,
    features: ["25 heures de vidéo", "Projets réels", "Jeux de données fournis", "Certificat"],
  },
  {
    id: "9",
    title: "Microsoft Azure Fundamentals",
    subtitle: "Découvrez l'écosystème Cloud de Microsoft",
    description: "Une introduction complète aux services Azure. Préparez la certification AZ-900 avec ce cours structuré.",
    imageUrl: "/microsoft-azure-cloud.jpg",
    instructor: {
      id: "inst-7",
      name: "Jean-Paul Ouedraogo",
      avatar: "/male-teacher-glasses.jpg",
      title: "Azure Solutions Architect",
      bio: "Consultant Cloud spécialisé sur les technologies Microsoft.",
      studentCount: 15000,
      courseCount: 3,
      rating: 4.7,
    },
    category: "Cloud Computing",
    level: "Débutant",
    rating: 4.7,
    reviewCount: 850,
    duration: "10",
    language: "Français",
    lastUpdated: "Janvier 2024",
    bestseller: false,
    objectives: [
      "Concepts du Cloud Azure",
      "Services Azure Core",
      "Solutions et outils de gestion",
      "Sécurité et réseau",
    ],
    curriculum: [],
    enrolledCount: 4200,
    features: ["10 heures de vidéo", "Guide d'étude PDF", "Support cours", "Certificat"],
  },
  {
    id: "10",
    title: "Introduction au Generative AI",
    subtitle: "Comprendre ChatGPT, LLMs et Prompt Engineering",
    description: "Apprenez comment fonctionnent les modèles de langage comme GPT-4 et comment les intégrer dans vos workflows.",
    imageUrl: "/generative-ai-brain-chip.jpg",
    instructor: {
      id: "inst-6",
      name: "Aminata Coulibaly",
      avatar: "/female-ai-engineer-portrait.jpg",
      title: "AI Research Lead",
      bio: "Chercheuse en IA passionnée par la démocratisation des technologies génératives.",
      studentCount: 31000,
      courseCount: 7,
      rating: 5.0,
    },
    category: "Intelligence Artificielle",
    level: "Débutant",
    rating: 5.0,
    reviewCount: 4500,
    duration: "8",
    language: "Français",
    lastUpdated: "Juin 2024",
    bestseller: true,
    objectives: [
      "Fonctionnement des LLMs",
      "Techniques de Prompt Engineering",
      "Cas d'usage Business",
      "Éthique et IA",
    ],
    curriculum: [],
    enrolledCount: 18000,
    features: ["8 heures de vidéo", "Templates de prompts", "Communauté Discord", "Certificat"],
  },
]

export const mockAchievements: Achievement[] = [
  {
    id: "ach-1",
    title: "Premier Pas",
    description: "Complétez votre première leçon",
    icon: "rocket",
    progress: 1,
    maxProgress: 1,
  },
  {
    id: "ach-2",
    title: "Marathonien",
    description: "7 jours d'affilée sur la plateforme",
    icon: "flame",
    progress: 0,
    maxProgress: 7,
  },
  {
    id: "ach-3",
    title: "Expert Quiz",
    description: "Obtenez 100% à 5 quiz",
    icon: "trophy",
    progress: 0,
    maxProgress: 5,
  },
  {
    id: "ach-4",
    title: "Collectionneur",
    description: "Complétez 10 cours",
    icon: "book",
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "ach-5",
    title: "Social Learner",
    description: "Aidez 10 autres étudiants",
    icon: "users",
    progress: 0,
    maxProgress: 10,
  },
]

export const mockLabs: Lab[] = [
  {
    id: "lab-1",
    courseId: "1",
    title: "Créer un composant React interactif",
    description: "Dans ce lab, vous allez créer un composant de formulaire avec validation.",
    instructions: `# Lab: Formulaire de Contact React

## Objectifs
- Créer un formulaire avec React Hook Form
- Ajouter la validation avec Zod
- Gérer les erreurs de manière élégante

## Instructions
1. Installez les dépendances nécessaires
2. Créez le schéma de validation
3. Implémentez le formulaire
4. Ajoutez la gestion d'erreurs

## Critères de réussite
- Le formulaire valide les emails
- Les messages d'erreur s'affichent correctement
- La soumission fonctionne`,
    starterCode: `import { useForm } from "react-hook-form"

export default function ContactForm() {
  // Votre code ici
  
  return (
    <form>
      {/* Ajoutez vos champs */}
    </form>
  )
}`,
    solution: `import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
})

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} placeholder="Nom" />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register("email")} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <textarea {...register("message")} placeholder="Message" />
      {errors.message && <span>{errors.message.message}</span>}
      
      <button type="submit">Envoyer</button>
    </form>
  )
}`,
    objectives: ["Utiliser React Hook Form", "Valider avec Zod", "Gérer les erreurs", "Soumettre le formulaire"],
    difficulty: "medium",
    estimatedTime: "30 min",
  },
]

