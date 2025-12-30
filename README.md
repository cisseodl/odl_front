# 🎓 Orange Digital Learning - Plateforme de Formation en Ligne

Une plateforme moderne de formation en ligne (LMS) développée pour **Orange Digital Center Mali**, construite avec Next.js, TypeScript et Tailwind CSS.

> 📚 **Pour une documentation complète et détaillée, consultez [DOCUMENTATION.md](./DOCUMENTATION.md)**

## 🚀 Fonctionnalités

### Pages Principales

- **Page d'accueil** (`/`) - Hero section, carrousels de cours, statistiques, témoignages
- **Catalogue de cours** (`/courses`) - Filtres avancés, tri, recherche
- **Détail cours** (`/courses/[id]`) - VideoPlayer, tabs, sidebar sticky
- **Lecteur de cours** (`/learn/[courseId]`) - Sidebar modules, player vidéo, notes
- **Quiz** (`/learn/[courseId]/quiz/[quizId]`) - QCM, timer, résultats
- **Labs pratiques** (`/learn/[courseId]/lab/[labId]`) - Éditeur de code, instructions
- **Dashboard étudiant** (`/dashboard`) - Stats, graphiques, progression
- **Profil utilisateur** (`/profile`) - Informations, certificats, préférences
- **Dashboard instructeur** (`/instructor/dashboard`) - Analytics, statistiques, cours

### Composants Réutilisables

- `VideoPlayer` - Lecteur vidéo avec contrôles personnalisés
- `CourseCard` - Carte de cours avec hover effects
- `AnimatedCounter` - Compteurs animés pour les statistiques
- `FadeInView` - Animations d'entrée avec Framer Motion
- `RatingStars` - Système de notation avec étoiles
- `SearchBar` - Barre de recherche avec autocomplete
- `ProgressBar` - Barre de progression animée

### Technologies

- **Framework**: Next.js 16.0.10 (App Router)
- **Langage**: TypeScript strict
- **Styling**: Tailwind CSS 4.1.9 + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Graphiques**: Recharts
- **Validation**: React Hook Form + Zod
- **Icônes**: Lucide React
- **Notifications**: Sonner

## 📦 Installation

### Prérequis

- Node.js 18+ 
- pnpm (recommandé) ou npm/yarn

### Étapes

1. **Cloner le projet** (si applicable)
```bash
git clone <repository-url>
cd online-learning-platform
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Lancer le serveur de développement**
```bash
pnpm dev
```

4. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 🛠️ Scripts Disponibles

```bash
# Développement
pnpm dev          # Lance le serveur de développement

# Production
pnpm build        # Construit l'application pour la production
pnpm start        # Lance le serveur de production

# Qualité de code
pnpm lint         # Vérifie le code avec ESLint
```

## 📁 Structure du Projet

```
online-learning-platform/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Page d'accueil
│   ├── courses/           # Pages cours
│   ├── learn/             # Lecteur de cours
│   ├── dashboard/         # Dashboard étudiant
│   ├── profile/           # Profil utilisateur
│   ├── cart/              # Panier
│   ├── checkout/          # Paiement
│   └── instructor/        # Espace instructeur
├── components/             # Composants React
│   ├── ui/               # Composants UI (shadcn)
│   ├── course-card.tsx   # Carte de cours
│   ├── video-player.tsx  # Lecteur vidéo
│   └── ...
├── lib/                   # Utilitaires et stores
│   ├── data.ts           # Données statiques (Server Components)
│   ├── constants.ts      # Constantes
│   ├── types.ts          # Types TypeScript
│   ├── utils.ts          # Fonctions utilitaires
│   └── store/            # Stores Zustand
├── public/                # Assets statiques
└── styles/                # Styles globaux
```

## 🎨 Design System

### Palette de Couleurs

- **Primary**: Bleu moderne (#3B82F6)
- **Secondary**: Violet (#8B5CF6)
- **Success**: Vert (#10B981)
- **Warning**: Orange (#F59E0B)
- **Danger**: Rouge (#EF4444)

### Typographie

- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Code**: Fira Code

## 🔑 Fonctionnalités Clés

### VideoPlayer

- Contrôles personnalisés (play/pause, volume, progression)
- Vitesses de lecture (0.5x à 2x)
- Qualités (360p, 720p, 1080p)
- Sous-titres
- Plein écran
- Raccourcis clavier (Espace, M, F, Flèches)

### Quiz

- Types de questions : QCM (single/multiple), Vrai/Faux
- Timer visible
- Navigation avec marquage pour revue
- Page de résultats avec score et corrections

### Labs Pratiques

- Instructions en Markdown
- Éditeur de code intégré
- Checklist des objectifs
- Solution affichable

### Dashboard

- Graphiques de progression (Recharts)
- Statistiques animées
- Badges et achievements
- Activité récente

## 🎯 Raccourcis Clavier

- **Espace** : Play/Pause (dans le lecteur vidéo)
- **M** : Mute/Unmute
- **F** : Plein écran
- **← →** : Navigation dans la vidéo (-10s / +10s)

## 📱 Responsive Design

- **Mobile** (< 768px) : Menu hamburger, cartes en colonne unique
- **Tablet** (768-1024px) : 2 colonnes pour grid cours
- **Desktop** (> 1024px) : Layout complet avec hover effects

## 🔒 Sécurité

- Validation des formulaires avec Zod
- Protection CSRF
- Données sensibles côté serveur uniquement

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connecter votre repository GitHub à Vercel
2. Vercel détectera automatiquement Next.js
3. Déployer en un clic

### Autres Plateformes

Le projet peut être déployé sur n'importe quelle plateforme supportant Next.js :
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📚 Documentation Complète

Pour une documentation détaillée incluant :
- Architecture complète du projet
- Guide de développement approfondi
- Documentation des composants
- Guide de déploiement
- Troubleshooting

👉 **Consultez [DOCUMENTATION.md](./DOCUMENTATION.md)**

## 📝 Notes Importantes

### Server vs Client Components

- Les données statiques sont dans `lib/data.ts` et `lib/constants.ts` pour être utilisables dans les Server Components
- Les composants avec `"use client"` sont dans `lib/mock-data.tsx` (réexporte depuis data.ts)

### Mock Data

Le projet utilise des données mock pour le développement. Pour la production, remplacez par des appels API réels.

### Authentification

- Les routes protégées nécessitent une authentification
- Page d'authentification : `/auth`
- Routes protégées : `/dashboard`, `/profile`, `/learn/*`

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)

---

**Développé avec ❤️ pour l'apprentissage en ligne**

