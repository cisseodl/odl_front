# 📚 Documentation Frontend - Orange Digital Center (ODL)

**Version**: 2.0.0  
**Dernière mise à jour**: Décembre 2024  
**Framework**: Next.js 16.0.10 (App Router)

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du Projet](#architecture-du-projet)
3. [Technologies Utilisées](#technologies-utilisées)
4. [Installation et Configuration](#installation-et-configuration)
5. [Structure des Dossiers](#structure-des-dossiers)
6. [Pages et Routes](#pages-et-routes)
7. [Composants Principaux](#composants-principaux)
8. [Gestion d'État](#gestion-détat)
9. [Authentification](#authentification)
10. [Design System](#design-system)
11. [Guide de Développement](#guide-de-développement)
12. [Déploiement](#déploiement)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

Orange Digital Center est une plateforme moderne de formation en ligne (LMS) développée pour **Orange Digital Center Mali**. La plateforme permet aux étudiants de suivre des cours en ligne gratuitement, de suivre leur progression, de passer des quiz et de réaliser des labs pratiques.

### Objectifs du Projet

- ✅ Offrir une plateforme d'apprentissage en ligne gratuite et accessible
- ✅ Permettre aux étudiants de suivre leur progression
- ✅ Fournir des outils interactifs (quiz, labs pratiques)
- ✅ Offrir une expérience utilisateur moderne et responsive

### Caractéristiques Principales

- 🎓 **Catalogue de cours** : Parcourir et rechercher parmi des milliers de cours
- 📊 **Dashboard étudiant** : Suivre sa progression et ses statistiques
- 🎥 **Lecteur vidéo** : Lecteur vidéo avancé avec contrôles personnalisés
- ✅ **Quiz interactifs** : Tests avec timer et résultats détaillés
- 💻 **Labs pratiques** : Exercices de codage avec éditeur intégré
- 👤 **Profil utilisateur** : Gérer ses informations et certificats
- 🔐 **Authentification** : Système de connexion/inscription

---

## 🏗️ Architecture du Projet

### Stack Technique

```
Frontend
├── Next.js 16.0.10 (App Router)
├── React 19.2.0
├── TypeScript 5.x
├── Tailwind CSS 4.1.9
└── shadcn/ui (Composants UI)
```

### Architecture des Données

```
État Global (Zustand)
├── auth-store.ts      → Authentification utilisateur
├── course-store.ts    → Gestion des cours favoris
├── ui-store.ts        → État UI (sidebar, thème)
└── user-store.ts      → Données utilisateur et progression
```

### Pattern de Développement

- **Server Components** : Par défaut pour les pages et composants sans interactivité
- **Client Components** : Avec `"use client"` pour les composants interactifs
- **Composants Réutilisables** : Dans `/components` pour la réutilisation
- **Hooks Personnalisés** : Dans `/hooks` pour la logique réutilisable

---

## 🛠️ Technologies Utilisées

### Core Framework

| Technologie | Version | Usage |
|------------|---------|-------|
| **Next.js** | 16.0.10 | Framework React avec App Router |
| **React** | 19.2.0 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.1.9 | Framework CSS utility-first |

### UI & Composants

| Technologie | Usage |
|------------|-------|
| **shadcn/ui** | Composants UI accessibles et personnalisables |
| **Radix UI** | Primitives UI headless |
| **Lucide React** | Bibliothèque d'icônes |
| **Framer Motion** | Animations fluides |

### State Management & Data

| Technologie | Usage |
|------------|-------|
| **Zustand** | Gestion d'état globale légère |
| **React Query** | Gestion des requêtes et cache |
| **React Hook Form** | Gestion des formulaires |
| **Zod** | Validation de schémas |

### Autres Bibliothèques

- **Recharts** : Graphiques et visualisations
- **Embla Carousel** : Carrousels et sliders
- **Sonner** : Notifications toast
- **React Markdown** : Rendu de contenu Markdown
- **date-fns** : Manipulation de dates

---

## 📦 Installation et Configuration

### Prérequis

- **Node.js** : Version 18 ou supérieure
- **pnpm** : Gestionnaire de paquets (recommandé) ou npm/yarn
- **Git** : Pour cloner le dépôt

### Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/cisseodl/odl_front.git
cd odl_front
```

2. **Installer les dépendances**
```bash
pnpm install
# ou
npm install
```

3. **Lancer le serveur de développement**
```bash
pnpm dev
# ou
npm run dev
```

4. **Ouvrir dans le navigateur**
```
https://smart-odc.com/```

### Configuration

#### Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# API Configuration (si applicable)
NEXT_PUBLIC_API_URL=https://api.smart-odc.com/

# Analytics (optionnel)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

#### Configuration TypeScript

Le fichier `tsconfig.json` est déjà configuré avec :
- Strict mode activé
- Path aliases (`@/` pour le dossier racine)
- Support des imports absolus

---

## 📁 Structure des Dossiers

```
ODC_Elearning-main/
├── app/                          # Pages Next.js (App Router)
│   ├── about/                    # Page À propos
│   ├── auth/                     # Authentification (login/register)
│   ├── categories/               # Page catégories
│   ├── contact/                  # Page contact
│   ├── courses/                  # Pages cours
│   │   ├── [id]/                # Détail d'un cours
│   │   └── page.tsx             # Liste des cours
│   ├── dashboard/                # Dashboard étudiant
│   ├── help/                     # Centre d'aide
│   ├── instructor/               # Espace instructeur
│   │   └── dashboard/
│   ├── learn/                    # Lecteur de cours
│   │   └── [courseId]/
│   │       ├── lab/              # Labs pratiques
│   │       ├── quiz/             # Quiz
│   │       └── page.tsx          # Lecteur principal
│   ├── learning/                 # Page "Mon Apprentissage"
│   ├── profile/                  # Profil utilisateur
│   ├── privacy/                  # Politique de confidentialité
│   ├── terms/                    # Conditions d'utilisation
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Page d'accueil
│   └── globals.css               # Styles globaux
│
├── components/                   # Composants React
│   ├── ui/                       # Composants UI (shadcn)
│   ├── animated-counter.tsx      # Compteur animé
│   ├── animated-stats.tsx        # Statistiques animées
│   ├── course-card.tsx           # Carte de cours
│   ├── course-detail-client.tsx # Détail cours (client)
│   ├── footer.tsx                # Footer
│   ├── header.tsx                # Header/Navigation
│   ├── protected-route.tsx       # Protection de routes
│   ├── quiz-timer.tsx            # Timer pour quiz
│   ├── video-player.tsx          # Lecteur vidéo
│   └── ...
│
├── hooks/                         # Hooks personnalisés
│   ├── use-aria-live-announcement.tsx
│   ├── use-focus-trap.ts
│   ├── use-mobile.ts
│   ├── use-scroll-spy.ts
│   └── use-toast.ts
│
├── lib/                          # Utilitaires et logique métier
│   ├── store/                    # Stores Zustand
│   │   ├── auth-store.ts        # Store authentification
│   │   ├── course-store.ts      # Store cours
│   │   ├── ui-store.ts          # Store UI
│   │   └── user-store.ts        # Store utilisateur
│   ├── constants.ts             # Constantes
│   ├── data.ts                  # Données mock (Server Components)
│   ├── mock-data.tsx            # Données mock (Client Components)
│   ├── react-query-provider.tsx # Provider React Query
│   ├── types.ts                 # Types TypeScript
│   └── utils.ts                 # Fonctions utilitaires
│
├── public/                       # Assets statiques
│   ├── logo.png                 # Logo ODL
│   ├── 3.jpeg                   # Images backgrounds
│   ├── 7.jpeg
│   └── ...
│
├── assets/                       # Assets source
│   └── images/                  # Images source
│
├── styles/                       # Styles additionnels
│   └── globals.css
│
├── package.json                 # Dépendances et scripts
├── tsconfig.json                # Configuration TypeScript
├── next.config.mjs              # Configuration Next.js
├── tailwind.config.ts           # Configuration Tailwind
└── README.md                    # Documentation principale
```

---

## 🗺️ Pages et Routes

### Routes Publiques (Accessibles sans authentification)

| Route | Description | Fichier |
|-------|-------------|---------|
| `/` | Page d'accueil avec hero, carrousels, statistiques | `app/page.tsx` |
| `/courses` | Catalogue de cours avec filtres | `app/courses/page.tsx` |
| `/courses/[id]` | Détail d'un cours | `app/courses/[id]/page.tsx` |
| `/about` | Page À propos d'Orange Digital Center Mali | `app/about/page.tsx` |
| `/contact` | Page de contact | `app/contact/page.tsx` |
| `/help` | Centre d'aide | `app/help/page.tsx` |
| `/terms` | Conditions d'utilisation | `app/terms/page.tsx` |
| `/privacy` | Politique de confidentialité | `app/privacy/page.tsx` |

### Routes Protégées (Nécessitent une authentification)

| Route | Description | Fichier | Protection |
|-------|-------------|---------|------------|
| `/auth` | Page de connexion/inscription | `app/auth/page.tsx` | - |
| `/dashboard` | Dashboard étudiant avec statistiques | `app/dashboard/page.tsx` | ✅ ProtectedRoute |
| `/profile` | Profil utilisateur | `app/profile/page.tsx` | ✅ ProtectedRoute |
| `/learning` | Page "Mon Apprentissage" | `app/learning/page.tsx` | ✅ ProtectedRoute |
| `/learn/[courseId]` | Lecteur de cours | `app/learn/[courseId]/page.tsx` | ✅ ProtectedRoute |
| `/learn/[courseId]/quiz/[quizId]` | Quiz d'un cours | `app/learn/[courseId]/quiz/[quizId]/page.tsx` | ✅ ProtectedRoute |
| `/learn/[courseId]/lab/[labId]` | Lab pratique | `app/learn/[courseId]/lab/[labId]/page.tsx` | ✅ ProtectedRoute |
| `/instructor/dashboard` | Dashboard instructeur | `app/instructor/dashboard/page.tsx` | ✅ ProtectedRoute |

### Système de Protection des Routes

Le composant `ProtectedRoute` vérifie l'authentification et redirige vers `/auth` si l'utilisateur n'est pas connecté :

```tsx
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {/* Contenu protégé */}
    </ProtectedRoute>
  )
}
```

---

## 🧩 Composants Principaux

### Composants de Navigation

#### `Header`
**Fichier**: `components/header.tsx`

Navigation principale avec :
- Logo ODL
- Menu de navigation (Dashboard, Cours, Mon Apprentissage, À propos)
- Barre de recherche
- Bouton profil (redirige vers `/auth` si non connecté)
- Menu mobile responsive

**Props**: Aucune (utilise `usePathname` et `useAuthStore`)

#### `Footer`
**Fichier**: `components/footer.tsx`

Footer avec :
- Liens de navigation
- Newsletter
- Réseaux sociaux
- Informations légales

### Composants de Cours

#### `CourseCard`
**Fichier**: `components/course-card.tsx`

Carte de cours avec :
- Image du cours
- Badge "Nouveau" (si cours récent)
- Titre et instructeur
- Rating avec étoiles
- Durée et niveau
- Actions hover (favoris, partage)

**Props**:
```tsx
interface CourseCardProps {
  course: Course
  showPreview?: boolean
}
```

#### `CourseDetailClient`
**Fichier**: `components/course-detail-client.tsx`

Page de détail d'un cours avec :
- Vidéo preview
- Tabs (Aperçu, Contenu, Instructeur, Avis)
- Sidebar sticky avec bouton d'inscription
- Informations du cours

**Props**:
```tsx
interface CourseDetailClientProps {
  course: Course
}
```

### Composants d'Apprentissage

#### `VideoPlayer`
**Fichier**: `components/video-player.tsx`

Lecteur vidéo avancé avec :
- Contrôles personnalisés
- Vitesses de lecture (0.5x à 2x)
- Qualités vidéo
- Sous-titres
- Raccourcis clavier (Espace, M, F, Flèches)
- Picture-in-picture

**Props**:
```tsx
interface VideoPlayerProps {
  src: string
  title?: string
  onProgress?: (progress: number) => void
  onEnded?: () => void
}
```

#### `QuizTimer`
**Fichier**: `components/quiz-timer.tsx`

Timer pour les quiz avec :
- Compte à rebours
- Alerte visuelle quand le temps est écoulé
- Format MM:SS

**Props**:
```tsx
interface QuizTimerProps {
  timeLimit: number // en secondes
  onTimeUp?: () => void
}
```

### Composants UI Réutilisables

#### `AnimatedStats`
**Fichier**: `components/animated-stats.tsx`

Statistiques animées avec compteurs qui s'incrémentent.

**Props**:
```tsx
interface AnimatedStatsProps {
  stats: Array<{
    value: number
    label: string
    useFormat?: boolean
    suffix?: string
  }>
}
```

#### `FadeInView`
**Fichier**: `components/fade-in-view.tsx`

Animation d'entrée avec Framer Motion.

**Props**:
```tsx
interface FadeInViewProps {
  children: React.ReactNode
  delay?: number
  duration?: number
}
```

---

## 🔄 Gestion d'État

### Stores Zustand

#### `auth-store.ts`
Gestion de l'authentification utilisateur.

```tsx
const { 
  user, 
  isAuthenticated, 
  isLoading,
  login,
  register,
  logout 
} = useAuthStore()
```

**Méthodes**:
- `login(email, password)` : Connexion utilisateur
- `register(name, email, password)` : Inscription
- `logout()` : Déconnexion
- `checkAuth()` : Vérifier l'état d'authentification

#### `course-store.ts`
Gestion des cours favoris.

```tsx
const { 
  favorites,
  toggleFavorite,
  isFavorite 
} = useCourseStore()
```

**Méthodes**:
- `toggleFavorite(courseId)` : Ajouter/retirer des favoris
- `isFavorite(courseId)` : Vérifier si un cours est favori

#### `ui-store.ts`
Gestion de l'état UI (sidebar, thème).

```tsx
const { 
  sidebarOpen,
  toggleSidebar 
} = useUIStore()
```

#### `user-store.ts`
Gestion des données utilisateur et progression.

```tsx
const { 
  userProgress,
  updateProgress,
  achievements 
} = useUserStore()
```

### React Query

React Query est utilisé pour la gestion des requêtes API et le cache.

**Provider**: `lib/react-query-provider.tsx`

```tsx
import { useQuery, useMutation } from "@tanstack/react-query"

// Exemple d'utilisation
const { data, isLoading } = useQuery({
  queryKey: ["courses"],
  queryFn: fetchCourses
})
```

---

## 🔐 Authentification

### Système d'Authentification

L'authentification est gérée via Zustand avec persistance locale.

**Fichier**: `lib/store/auth-store.ts`

### Flux d'Authentification

1. **Inscription/Connexion** : Page `/auth`
2. **Stockage** : Token et données utilisateur dans localStorage
3. **Protection** : Routes protégées via `ProtectedRoute`
4. **Redirection** : Vers `/auth` si non authentifié

### Page d'Authentification

**Fichier**: `app/auth/page.tsx`

- Onglets Connexion/Inscription
- Validation des formulaires avec React Hook Form + Zod
- Gestion des erreurs avec Sonner (toast)
- Redirection automatique vers `/dashboard` après connexion

### Protection des Routes

**Composant**: `components/protected-route.tsx`

```tsx
<ProtectedRoute>
  {/* Contenu protégé */}
</ProtectedRoute>
```

**Comportement**:
- Vérifie `isAuthenticated` depuis `auth-store`
- Affiche un loader pendant la vérification
- Redirige vers `/auth` si non authentifié
- Affiche le contenu si authentifié

---

## 🎨 Design System

### Palette de Couleurs

Le projet utilise Tailwind CSS avec une palette personnalisée :

```css
/* Couleurs principales */
--primary: #FF7900;        /* Orange Digital */
--primary-foreground: #FFFFFF;

/* Couleurs secondaires */
--secondary: #F5F5F5;
--muted: #F9FAFB;
--accent: #8B5CF6;

/* États */
--success: #10B981;
--warning: #F59E0B;
--destructive: #EF4444;
```

### Typographie

- **Police principale** : Inter (via Tailwind)
- **Tailles** : Utilisation de l'échelle Tailwind (text-sm, text-base, text-lg, etc.)
- **Poids** : Regular (400), Medium (500), Semibold (600), Bold (700)

### Composants UI (shadcn/ui)

Le projet utilise shadcn/ui pour les composants de base :
- Button
- Card
- Input
- Select
- Tabs
- Dialog
- Toast
- Et plus de 50 autres composants

**Configuration**: `components.json`

### Responsive Design

- **Mobile** : < 768px (1 colonne, menu hamburger)
- **Tablet** : 768px - 1024px (2 colonnes)
- **Desktop** : > 1024px (Layout complet)

### Animations

- **Framer Motion** : Animations d'entrée et transitions
- **Tailwind Animate** : Animations CSS simples
- **Transitions** : 200-300ms pour les interactions

---

## 💻 Guide de Développement

### Ajouter une Nouvelle Page

1. **Créer le fichier** dans `app/` :
```tsx
// app/ma-page/page.tsx
export default function MaPage() {
  return <div>Ma nouvelle page</div>
}
```

2. **Si besoin d'interactivité**, ajouter `"use client"` :
```tsx
"use client"

import { useState } from "react"

export default function MaPage() {
  const [state, setState] = useState()
  return <div>...</div>
}
```

### Ajouter un Nouveau Composant

1. **Créer le fichier** dans `components/` :
```tsx
// components/mon-composant.tsx
interface MonComposantProps {
  title: string
}

export function MonComposant({ title }: MonComposantProps) {
  return <div>{title}</div>
}
```

2. **Exporter** depuis le fichier ou importer directement

### Ajouter un Store Zustand

1. **Créer le fichier** dans `lib/store/` :
```tsx
// lib/store/mon-store.ts
import { create } from "zustand"

interface MonStore {
  data: string[]
  addData: (item: string) => void
}

export const useMonStore = create<MonStore>((set) => ({
  data: [],
  addData: (item) => set((state) => ({ 
    data: [...state.data, item] 
  }))
}))
```

### Bonnes Pratiques

1. **TypeScript** : Toujours typer les props et états
2. **Composants** : Un composant par fichier
3. **Nommage** : PascalCase pour les composants, camelCase pour les fonctions
4. **Imports** : Utiliser les path aliases (`@/components`, `@/lib`)
5. **Performance** : Utiliser `useMemo` et `useCallback` quand nécessaire
6. **Accessibilité** : Ajouter les attributs ARIA appropriés

### Formatage du Code

Le projet utilise ESLint pour le linting :

```bash
pnpm lint
```

### Structure d'un Composant TypeScript

```tsx
"use client" // Si nécessaire

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface MonComposantProps {
  title: string
  optional?: boolean
}

export function MonComposant({ title, optional = false }: MonComposantProps) {
  const [state, setState] = useState<string>("")

  return (
    <div>
      <h1>{title}</h1>
      {optional && <p>Optionnel</p>}
      <Button onClick={() => setState("clicked")}>
        Cliquer
      </Button>
    </div>
  )
}
```

---

## 🚀 Déploiement

### Préparation pour la Production

1. **Build de production** :
```bash
pnpm build
```

2. **Vérifier le build** :
```bash
pnpm start
```

### Déploiement sur Vercel (Recommandé)

1. **Connecter le dépôt GitHub** à Vercel
2. **Configuration automatique** : Vercel détecte Next.js
3. **Variables d'environnement** : Ajouter dans les paramètres Vercel
4. **Déployer** : Le déploiement se fait automatiquement à chaque push

### Déploiement sur Autres Plateformes

#### Netlify
```bash
# Build command
pnpm build

# Publish directory
.next
```

#### AWS Amplify
- Connecter le dépôt
- Build settings : `pnpm build`
- Output directory : `.next`

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables d'Environnement en Production

Assurez-vous de configurer :
- `NEXT_PUBLIC_API_URL` : URL de l'API backend
- `NEXT_PUBLIC_ANALYTICS_ID` : ID Analytics (optionnel)

---

## 🔧 Troubleshooting

### Problèmes Courants

#### Erreur "Module not found"
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Erreur de Build TypeScript
```bash
# Vérifier les types
pnpm lint
# Corriger les erreurs de typage
```

#### Port 3000 déjà utilisé
```bash
# Utiliser un autre port
pnpm dev -- -p 3001
```

#### Erreur de Parsing JSX
- Vérifier que tous les composants sont correctement fermés
- Vérifier les imports
- Vérifier la syntaxe JSX

### Debug

#### Mode Debug Next.js
```bash
NODE_OPTIONS='--inspect' pnpm dev
```

#### Logs Détaillés
```bash
DEBUG=* pnpm dev
```

---

## 📚 Ressources et Références

### Documentation Officielle

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

### Bibliothèques Utilisées

- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)
- [Framer Motion](https://www.framer.com/motion)
- [Recharts](https://recharts.org)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

### Liens Utiles

- [Orange Digital Center Mali - LinkedIn](https://ml.linkedin.com/company/orange-digital-center-mali)
- [Repository GitHub](https://github.com/cisseodl/odl_front)

---

## 📝 Notes Importantes

### Données Mock

Le projet utilise actuellement des données mock pour le développement. Pour la production :
1. Remplacer les appels dans `lib/data.ts` par des appels API réels
2. Configurer les endpoints dans les variables d'environnement
3. Implémenter la gestion d'erreurs API

### Server vs Client Components

- **Server Components** : Par défaut dans Next.js App Router
- **Client Components** : Ajouter `"use client"` en haut du fichier
- **Données statiques** : Utiliser `lib/data.ts` pour Server Components
- **Données dynamiques** : Utiliser `lib/mock-data.tsx` pour Client Components

### Performance

- Images : Utiliser le composant `Image` de Next.js
- Code splitting : Automatique avec Next.js
- Lazy loading : Utiliser `dynamic` import pour les composants lourds

---

## 🤝 Contribution

### Processus de Contribution

1. Créer une branche depuis `main`
2. Faire les modifications
3. Tester localement
4. Créer une Pull Request
5. Attendre la revue de code

### Standards de Code

- Respecter les conventions TypeScript
- Ajouter des commentaires pour le code complexe
- Tester les nouvelles fonctionnalités
- Mettre à jour la documentation si nécessaire

---

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation officielle

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 2.0.0  
**Maintenu par** : Équipe Orange Digital Center Mali

---

*Cette documentation est maintenue à jour avec le projet. Pour toute suggestion d'amélioration, n'hésitez pas à ouvrir une issue.*

