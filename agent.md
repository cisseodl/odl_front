Crée une plateforme moderne de formation en ligne (LMS) avec React/Next.js et Tailwind CSS, inspirée de Udemy et StudyRaid.

**IMPORTANT** : Cette plateforme est destinée à l'apprentissage et à la formation, **SANS commercialisation ni vente de formations**. Tous les cours sont accessibles gratuitement après inscription.

=== ARCHITECTURE GLOBALE ===

Stack technique :
- Next.js 14+ (App Router)
- TypeScript strict
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod (validation)
- Zustand (state management)
- React Query (data fetching)
- Lucide React (icônes)

=== PAGES & ROUTES PRINCIPALES ===

1. PAGE D'ACCUEIL (/)
   - Hero section avec CTA "Explorer les cours" et "Devenir instructeur"
   - Barre de recherche avancée (catégories, niveaux)
   - Carrousel de cours populaires/nouveaux
   - Statistiques clés : X étudiants, Y cours, Z instructeurs
   - Témoignages en grille 3 colonnes
   - Footer complet (liens, réseaux sociaux, newsletter)

2. CATALOGUE DE COURS (/courses)
   - Sidebar filtres : Catégories, Niveau, Durée, Note, Langue
   - Grid responsive de cartes cours (4 cols desktop, 2 tablet, 1 mobile)
   - Chaque carte : Image, Titre, Instructeur, Note (étoiles), Durée, Badge "Populaire"
   - Pagination ou infinite scroll
   - Tri : Popularité, Note, Récent
   - Compteur de résultats

3. DÉTAIL COURS (/courses/[id])
   Structure en 2 colonnes :
   
   Colonne gauche (70%) :
   - Breadcrumb navigation
   - Titre + sous-titre
   - Rating + nombre d'étudiants + dernière MAJ
   - Vidéo preview (player intégré)
   - Tabs : 
     * Aperçu (description riche, objectifs d'apprentissage)
     * Contenu (accordéon des modules/chapitres avec durées)
     * Instructeur (bio, photo, stats)
     * Avis (filtres par note, pagination)
     * FAQ
   
   Colonne droite (30%) - Sticky card :
   - Bouton : "S'inscrire au cours" (gratuit)
   - Ce que vous obtenez : durée totale, ressources, accès lifetime, certificat
   - Partage social
   - Informations : niveau, langue, instructeur

4. LECTEUR DE COURS (/learn/[courseId])
   Layout 3 zones :
   
   Left Sidebar (250px) - Collapsible :
   - Liste des modules/chapitres
   - Icônes : vidéo, quiz, document, lab
   - Checkmarks pour contenu complété
   - Barre progression globale en haut
   
   Zone centrale :
   - Video player (contrôles custom : vitesse, qualité, CC, fullscreen)
   - Tabs sous la vidéo : 
     * Transcription
     * Ressources téléchargeables
     * Notes personnelles (éditeur rich text)
   
   Right Sidebar (conditionnelle) :
   - Chat communautaire ou Q&A
   - Notes rapides

5. QUIZ/EXERCICES (/learn/[courseId]/quiz/[quizId])
   - Timer visible (si limité)
   - Progression (question X/Y)
   - Types de questions :
     * QCM (single/multiple choice)
     * Vrai/Faux
     * Réponse courte
     * Code (editor avec syntax highlighting)
   - Navigation : Précédent, Suivant, Marquer pour revue
   - Page résultats : score, corrections détaillées, bouton refaire

6. LABS PRATIQUES (/learn/[courseId]/lab/[labId])
   - Instructions à gauche (markdown)
   - Terminal/IDE embarqué à droite (iframe ou Monaco Editor)
   - Checklist des objectifs
   - Bouton "Vérifier ma solution"
   - Timer optionnel

7. DASHBOARD ÉTUDIANT (/dashboard)
   Sections :
   - Stats personnelles (4 cartes) : Cours en cours, Complétés, Heures, Certificats
   - Graphique progression hebdomadaire (ligne)
   - "Continuer l'apprentissage" (3 derniers cours)
   - Cours recommandés (basés sur historique)
   - Badges/Achievements en grille
   - Calendrier des sessions live à venir

8. PROFIL UTILISATEUR (/profile)
   Tabs :
   - Informations (édition formulaire)
   - Mes cours (grid avec filtres)
   - Certificats (téléchargement PDF)
   - Préférences (notifications, langue, thème)

9. ESPACE INSTRUCTEUR (/instructor/dashboard)
    - Vue d'ensemble : étudiants, notes moyennes, engagement
    - Mes cours (liste avec stats par cours)
    - Créer/éditer cours (form multi-steps)
    - Messages étudiants
    - Analytics détaillées (graphiques engagement, progression étudiants)

=== COMPOSANTS RÉUTILISABLES ===

CourseCard :
- Image avec overlay gradient
- Badge catégorie (top-left)
- Badge "Populaire" (top-right si applicable)
- Titre (2 lignes max, ellipsis)
- Nom instructeur avec avatar
- Rating étoiles + (X avis)
- Badge "Gratuit" visible
- Bouton hover : "Voir le cours"
- Footer : durée + niveau

VideoPlayer :
- Contrôles personnalisés
- Barre progression avec thumbnails au hover
- Vitesses : 0.5x à 2x
- Qualités : 360p, 720p, 1080p
- Sous-titres multiples langues
- Picture-in-picture
- Keyboard shortcuts (espace, flèches, M pour mute)

ProgressBar :
- Animée avec gradient
- Affichage pourcentage
- Tooltip au hover avec détails

RatingStars :
- Étoiles pleines/demi/vides
- Taille configurable
- Nombre d'avis à côté

SearchBar :
- Autocomplete avec suggestions
- Catégories en dropdown
- Filtres rapides (chips)
- Icône de recherche + loading spinner

ModuleAccordion :
- Expand/collapse animé
- Icônes type de contenu
- Durée totale module
- Nombre d'éléments complétés

=== DESIGN SYSTEM ===

Palette :
- Primary : Orange Digital (#FF7900) - Maximiser l'impact
- Secondary : Noir (#000000) - Couleur primaire
- Accent : Blanc (#FFFFFF) - Couleur primaire
- Success : Orange (#FF7900) - Pour succès
- Warning : Orange (#FF7900) - Pour attention
- Danger : Noir (#000000) - Pour erreurs
- Neutral : Gris (#737373) - Usage modéré uniquement
- Background : Blanc (#FFFFFF) / Dark (#000000)

Typographie :
- Headings : Inter Bold
- Body : Inter Regular
- Code : Fira Code

Espacements :
- Section padding : 80px vertical
- Cards gap : 24px
- Éléments gap : 16px

Effets :
- Cards : shadow-md, hover:shadow-xl, transition
- Boutons : hover:scale-105, active:scale-95
- Images : hover:brightness-110

=== FONCTIONNALITÉS INTERACTIVES ===

1. Dark mode toggle (coin supérieur droit)
2. Notifications toast (succès, erreur, info)
3. Modal confirmations (suppression, déconnexion)
4. Skeleton loaders pendant chargement
5. Infinite scroll sur catalogue
6. Drag & drop upload de fichiers
7. Animations d'entrée (fade-in, slide-up) avec Framer Motion
8. Compteurs animés pour statistiques
9. Tooltips informatifs

=== RESPONSIVE DESIGN ===

Mobile (<768px) :
- Menu hamburger
- Cartes cours en colonne unique
- Sidebar cours en bottom sheet
- Video player plein écran par défaut

Tablet (768-1024px) :
- 2 colonnes pour grid cours
- Sidebar repliable

Desktop (>1024px) :
- Layout complet
- Hover effects actifs

=== ÉTAT & DATA MANAGEMENT ===

Zustand stores :
- authStore : user, login, logout
- courseStore : enrolled, progress, updateProgress
- uiStore : theme, sidebarOpen, modalOpen

Mock data (pour développement) :
- 20 cours variés avec toutes les props
- 5 catégories
- Utilisateur connecté avec progression

=== ACCESSIBILITÉ ===

- Labels aria sur tous les interactifs
- Focus visible sur navigation clavier
- Contraste WCAG AA minimum
- Alt text sur toutes les images
- Skip to content link
- Annonces screen reader pour actions

=== PERFORMANCE ===

- Images avec Next/Image (lazy loading)
- Code splitting par route
- Memoization composants lourds
- Debounce sur search input
- Virtual scrolling pour longues listes

=== BONUS AVANCÉS ===

- Mode hors-ligne (Service Worker) pour cours téléchargés
- Chromecast support pour vidéos
- Keyboard shortcuts liste (modal aide)
- Export progression en PDF
- Gamification : badges animés au déblocage
- Confettis à la complétion d'un cours
- Leaderboard hebdomadaire (tableau avec avatars)

=== OUTPUT ATTENDU ===

Génère une application Next.js complète avec :
1. Structure de dossiers professionnelle
2. Au moins 5 pages fonctionnelles
3. 10+ composants réutilisables
4. Mock data réaliste
5. Animations fluides
6. Code TypeScript typé
7. Commentaires explicatifs
8. README avec instructions

Commence par la page d'accueil, puis le catalogue de cours avec cartes interactives.

=== API & BACKEND ARCHITECTURE ===

Routes API (Next.js App Router) :

/api/auth
  - POST /login : Authentification utilisateur
  - POST /register : Inscription
  - POST /logout : Déconnexion
  - GET /me : Récupérer utilisateur connecté
  - POST /refresh : Rafraîchir token

/api/courses
  - GET / : Liste des cours (query params : category, level, sort, page)
  - GET /[id] : Détails d'un cours
  - GET /[id]/reviews : Avis d'un cours
  - POST /[id]/enroll : S'inscrire à un cours (gratuit)
  - GET /[id]/progress : Progression dans un cours
  - PUT /[id]/progress : Mettre à jour la progression

/api/instructor
  - GET /courses : Cours de l'instructeur
  - POST /courses : Créer un cours
  - PUT /courses/[id] : Modifier un cours
  - DELETE /courses/[id] : Supprimer un cours
  - GET /analytics : Statistiques instructeur (engagement, progression)
  - GET /students : Liste des étudiants

/api/user
  - GET /profile : Profil utilisateur
  - PUT /profile : Modifier le profil
  - GET /certificates : Certificats obtenus
  - GET /achievements : Badges et achievements

/api/search
  - GET / : Recherche globale (cours, instructeurs, catégories)
  - GET /suggestions : Suggestions de recherche

=== SCHÉMA DE BASE DE DONNÉES ===

Tables principales :

Users :
- id (UUID, PK)
- email (string, unique)
- password_hash (string)
- name (string)
- avatar_url (string, nullable)
- role (enum: student, instructor, admin)
- created_at (timestamp)
- updated_at (timestamp)
- preferences (JSON)

Courses :
- id (UUID, PK)
- title (string)
- slug (string, unique)
- description (text)
- short_description (string)
- thumbnail_url (string)
- preview_video_url (string)
- category (string)
- level (enum: beginner, intermediate, advanced)
- language (string)
- duration_minutes (integer)
- instructor_id (UUID, FK -> Users)
- rating (decimal, computed)
- review_count (integer)
- enrolled_count (integer)
- popular (boolean)
- published (boolean)
- created_at (timestamp)
- updated_at (timestamp)

Modules :
- id (UUID, PK)
- course_id (UUID, FK -> Courses)
- title (string)
- order (integer)
- created_at (timestamp)

Lessons :
- id (UUID, PK)
- module_id (UUID, FK -> Modules)
- title (string)
- type (enum: video, quiz, document, lab)
- content_url (string, nullable)
- duration_minutes (integer)
- order (integer)
- created_at (timestamp)

Enrollments :
- id (UUID, PK)
- user_id (UUID, FK -> Users)
- course_id (UUID, FK -> Courses)
- enrolled_at (timestamp)
- completed_at (timestamp, nullable)
- progress_percentage (integer)

Progress :
- id (UUID, PK)
- enrollment_id (UUID, FK -> Enrollments)
- lesson_id (UUID, FK -> Lessons)
- completed (boolean)
- completed_at (timestamp, nullable)
- time_spent_minutes (integer)

Reviews :
- id (UUID, PK)
- course_id (UUID, FK -> Courses)
- user_id (UUID, FK -> Users)
- rating (integer, 1-5)
- comment (text)
- created_at (timestamp)
- updated_at (timestamp)

Certificates :
- id (UUID, PK)
- user_id (UUID, FK -> Users)
- course_id (UUID, FK -> Courses)
- issued_at (timestamp)
- pdf_url (string)

=== AUTHENTIFICATION & AUTORISATION ===

Stratégie :
- JWT tokens (access + refresh)
- HttpOnly cookies pour refresh tokens
- NextAuth.js ou custom middleware
- Rôles : student, instructor, admin

Middleware de protection :
- /dashboard/* : Requiert authentification
- /instructor/* : Requiert rôle instructor
- /learn/* : Requiert enrollment au cours

Sessions :
- Durée access token : 15 minutes
- Durée refresh token : 7 jours
- Rotation des tokens à chaque refresh

=== GESTION D'ERREURS ===

Types d'erreurs :
- ValidationError (400) : Données invalides
- UnauthorizedError (401) : Non authentifié
- ForbiddenError (403) : Pas les permissions
- NotFoundError (404) : Ressource introuvable
- ConflictError (409) : Conflit (ex: déjà inscrit)
- RateLimitError (429) : Trop de requêtes
- ServerError (500) : Erreur serveur

Format de réponse API :
{
  "success": boolean,
  "data": any,
  "error": {
    "code": string,
    "message": string,
    "details": any
  }
}

Error boundaries React :
- Global error boundary pour erreurs non capturées
- Error boundaries par section (dashboard, courses, etc.)
- Fallback UI avec bouton "Réessayer"

=== SÉCURITÉ ===

Mesures de sécurité :
- Validation côté serveur (Zod schemas)
- Sanitization des inputs utilisateur
- Protection CSRF (tokens)
- Rate limiting (10 req/s par IP)
- SQL injection protection (parametrized queries)
- XSS protection (sanitize HTML)
- CORS configuré strictement
- Headers de sécurité (Helmet.js)
- HTTPS obligatoire en production
- Secrets dans variables d'environnement
- Hashage des mots de passe (bcrypt, 10 rounds)

Upload de fichiers :
- Validation type MIME
- Limite de taille (10MB images, 500MB vidéos)
- Scan antivirus (optionnel)
- Stockage sécurisé (S3 avec signed URLs)

=== TESTS ===

Stratégie de tests :

Unit tests (Jest + React Testing Library) :
- Composants réutilisables
- Hooks personnalisés
- Utilitaires (formatters, validators)
- Stores Zustand

Integration tests :
- Flux d'authentification
- Inscription à un cours
- Mise à jour de progression

E2E tests (Playwright) :
- Parcours complet utilisateur
- Parcours instructeur
- Navigation responsive

Coverage cible : 80% minimum

=== DÉPLOIEMENT ===

Environnements :
- Development : localhost
- Staging : Vercel preview
- Production : Vercel production

Variables d'environnement :
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- AWS_ACCESS_KEY_ID (pour uploads)
- AWS_SECRET_ACCESS_KEY
- AWS_S3_BUCKET
- EMAIL_SERVICE_API_KEY

Build & Deploy :
- Build automatique sur push main
- Tests avant déploiement
- Migrations DB automatiques
- Health checks après déploiement

CI/CD Pipeline :
1. Lint (ESLint)
2. Type check (TypeScript)
3. Unit tests
4. Build Next.js
5. E2E tests (staging)
6. Deploy production

=== MONITORING & ANALYTICS ===

Monitoring :
- Vercel Analytics (performance)
- Sentry (error tracking)
- Uptime monitoring (Pingdom/UptimeRobot)
- Logs centralisés (Vercel Logs)

Métriques à suivre :
- Temps de chargement des pages
- Taux d'erreur API
- Engagement utilisateur (temps sur site)
- Taux de complétion des cours
- Taux d'inscription aux cours

Analytics utilisateur :
- Google Analytics 4 (optionnel)
- Événements custom :
  * course_viewed
  * course_enrolled
  * lesson_completed
  * quiz_completed
  * certificate_earned

=== INTERNATIONALISATION (i18n) ===

Support multilingue :
- next-intl ou react-i18next
- Langues : FR (par défaut), EN, ES
- Traduction des textes UI
- Format des dates/nombres selon locale
- RTL support (optionnel)

Fichiers de traduction :
- /messages/fr.json
- /messages/en.json
- /messages/es.json

=== INTÉGRATIONS TIERCES ===

Services externes :

Email (SendGrid/Resend) :
- Emails de bienvenue
- Notifications de progression
- Rappels de cours
- Confirmations d'inscription

CDN (Cloudflare/CloudFront) :
- Distribution de vidéos
- Cache des assets statiques
- DDoS protection

Storage (AWS S3/Cloudflare R2) :
- Images de cours
- Vidéos
- Documents PDF
- Certificats générés

Video hosting (optionnel) :
- Vimeo Pro
- Mux
- Cloudflare Stream

=== OPTIMISATIONS AVANCÉES ===

Performance :
- ISR (Incremental Static Regeneration) pour pages cours
- Edge caching pour API routes
- Image optimization (Next/Image + WebP)
- Font optimization (next/font)
- Bundle analysis (webpack-bundle-analyzer)
- Tree shaking automatique

SEO :
- Metadata dynamiques (next/head)
- Sitemap.xml généré
- robots.txt configuré
- Open Graph tags
- Schema.org markup (Course, Review)
- Canonical URLs

Accessibilité avancée :
- Tests avec axe-core
- Navigation au clavier complète
- Support lecteurs d'écran (NVDA, JAWS)
- Mode contraste élevé
- Taille de police ajustable

=== UX/UI DESIGN - EXPERTISE & RECOMMANDATIONS ===

=== PRINCIPES UX FONDAMENTAUX ===

1. HIÉRARCHIE VISUELLE :
   - Taille de police : H1 (48px), H2 (36px), H3 (24px), Body (16px)
   - Poids typographique : Bold pour titres, Medium pour sous-titres, Regular pour texte
   - Espacement vertical : 8px base (4px, 8px, 16px, 24px, 32px, 48px, 64px)
   - Contraste : Minimum 4.5:1 pour texte normal, 3:1 pour texte large
   - Z-index scale : 0 (base), 10 (dropdowns), 20 (sticky), 30 (overlay), 40 (modal), 50 (tooltip)

2. NAVIGATION & ORIENTATION :
   - Breadcrumbs visibles sur toutes les pages (sauf accueil)
   - Menu principal sticky avec indicateur de page active
   - "Retour en haut" button (apparaît après scroll 300px)
   - Navigation contextuelle dans le lecteur (précédent/suivant)
   - Indicateur de progression globale visible (header ou sidebar)

3. FEEDBACK UTILISATEUR :
   - États de boutons : default, hover, active, disabled, loading
   - Messages de succès/erreur avec icônes et auto-dismiss (3-5s)
   - Confirmations pour actions destructives (suppression, déconnexion)
   - Loading states : skeleton loaders > spinners > progress bars
   - Optimistic UI updates (favoris, progression)

4. COGNITIVE LOAD :
   - Limiter à 7±2 éléments par section
   - Groupement visuel (cards, sections, whitespace)
   - Progressive disclosure (accordéons, tabs, modals)
   - Chunking information (formulaire multi-steps)
   - Micro-interactions pour guider l'attention

=== AMÉLIORATIONS PAR PAGE ===

PAGE D'ACCUEIL :
- Hero section :
  * CTA principal plus grand (h-14, px-8) avec gradient
  * Vidéo background optionnelle (autoplay, muted, loop)
  * Trust indicators : "Rejoint par 250k+ étudiants", badges certifications
  * Social proof : "Recommandé par [logos entreprises]"
  
- Barre de recherche :
  * Placeholder suggestif : "Rechercher un cours, un sujet, un instructeur..."
  * Suggestions en temps réel (debounce 300ms)
  * Historique de recherche (localStorage)
  * Filtres rapides visibles (chips : Populaire, Nouveau)
  
- Carrousels :
  * Navigation visible (flèches + dots)
  * Auto-play avec pause au hover
  * Indicateur "X cours restants"
  * Lazy loading des images hors viewport
  
- Statistiques :
  * Animations au scroll (Intersection Observer)
  * Icônes animées (pulse subtil)
  * Formatage intelligent (1.2k au lieu de 1200)
  
- Témoignages :
  * Photos réelles avec avatars
  * Note visible (étoiles)
  * Date de l'avis
  * Carrousel avec autoplay lent

CATALOGUE DE COURS :
- Filtres sidebar :
  * Accordéons par catégorie (collapsed par défaut)
  * Compteurs dynamiques : "Développement Web (45)"
  * Reset filters button visible
  * Filtres actifs affichés en chips au-dessus des résultats
  * Range sliders pour durée avec valeurs min/max
  
- Grille de cours :
  * View toggle : Grid / List (préférence sauvegardée)
  * Tri sticky en haut avec dropdown
  * Résultats : "X cours trouvés" + temps de recherche
  * Empty state : illustration + message + CTA "Explorer toutes les catégories"
  * Pagination : "Page X sur Y" + navigation clavier
  
- Cartes cours améliorées :
  * Hover : légère élévation + ombre portée
  * Badge "Nouveau" (cours < 30 jours)
  * Badge "Gratuit" avec couleur distincte
  * Preview au hover : extrait description (2 lignes)
  * Quick actions : favoris, partage

DÉTAIL COURS :
- Section vidéo preview :
  * Thumbnail avec play button overlay (grand, centré)
  * Durée visible sur thumbnail
  * Modal fullscreen pour preview
  * Indicateur "Aperçu gratuit"
  
- Tabs améliorées :
  * Indicateur de contenu (badge avec nombre : "Avis (127)")
  * Scroll spy : tab active highlightée au scroll
  * Sticky tabs en mobile (bottom navigation)
  
- Sidebar sticky :
  * Animation smooth au scroll
  * Badge "Populaire" si applicable
  * CTA principal : "S'inscrire gratuitement" (gradient, ombre, animation pulse subtile)
  * Trust badges : "Accès à vie", "Certificat inclus", "Gratuit"
  
- Section avis :
  * Filtres par note (chips : Tous, 5★, 4★, etc.)
  * Tri : Plus récents, Plus utiles, Plus pertinents
  * Avis vérifiés (badge "Inscrit vérifié")
  * Helpful votes (thumbs up/down)
  * Réponses instructeur mises en évidence

LECTEUR DE COURS :
- Sidebar modules :
  * Recherche dans le contenu (filtre modules/leçons)
  * Indicateur de position actuelle (highlight + scroll auto)
  * Progression par module (barre mince sous titre)
  * Badges : "Nouveau", "Recommandé", "Important"
  * Expand/collapse tous les modules
  * Durée totale visible en haut
  
- Player vidéo :
  * Contrôles toujours visibles (pas de fade-out sur mobile)
  * Mini player en bas à droite lors du scroll
  * Picture-in-picture natif
  * Bookmarks : marquer des moments importants
  * Speed control visible (pas caché dans menu)
  * Sous-titres : taille ajustable, fond personnalisable
  
- Zone notes :
  * Auto-save avec indicateur "Sauvegardé"
  * Timestamps cliquables depuis la transcription
  * Export notes en PDF/Markdown
  * Recherche dans les notes
  * Partage notes (optionnel, privé par défaut)
  
- Navigation leçons :
  * Boutons précédent/suivant sticky (bottom mobile)
  * Indicateur "X/Y leçons complétées"
  * Auto-play prochaine leçon (toggle dans settings)
  * Raccourci clavier : N (next), P (previous)

QUIZ :
- Interface améliorée :
  * Progression circulaire (ring) en plus de la barre
  * Temps restant : barre + countdown + warning à 1min
  * Questions marquées : indicateur visuel (icône flag)
  * Navigation latérale : mini-map des questions
  * Sauvegarde automatique des réponses
  
- Types de questions :
  * QCM : animations au sélection (checkmark animé)
  * Code : thème éditeur synchronisé avec app (dark/light)
  * Drag & drop : feedback visuel (glow sur drop zone)
  
- Résultats :
  * Animation confettis pour score > 80%
  * Graphique de performance par catégorie
  * Corrections détaillées avec explications
  * Recommandations de révision ("Revoir leçon X")
  * Partage résultats (optionnel)

DASHBOARD ÉTUDIANT :
- Stats cards :
  * Icônes animées (lottie ou CSS)
  * Comparaison période précédente (+15% vs mois dernier)
  * Tooltips explicatifs au hover
  * Clic sur carte → page détaillée
  
- Graphique progression :
  * Sélection période : 7j, 30j, 90j, 1an
  * Points interactifs avec tooltip
  * Ligne de tendance
  * Comparaison objectif (ligne pointillée)
  
- Section "Continuer" :
  * Mini player intégré (dernière position)
  * Progression visible (barre)
  * Temps depuis dernière session
  * Badge "Nouveau contenu" si cours mis à jour
  
- Recommandations :
  * Carrousel horizontal
  * Badge "Basé sur vos intérêts"
  * Filtre : Tous, Nouveaux, Populaires
  * Empty state si pas d'historique

=== MICRO-INTERACTIONS ===

Animations subtiles :
- Boutons : scale 1.02 au hover, 0.98 au click (100ms ease-out)
- Cards : translateY -2px au hover (200ms ease)
- Modals : fade-in + scale 0.95→1 (200ms ease-out)
- Toasts : slide-in depuis droite + fade (300ms)
- Page transitions : fade (150ms) entre routes
- Loading : skeleton pulse (1.5s infinite)
- Success : checkmark animé (stroke-dasharray)
- Error : shake horizontal (300ms)

Feedback tactile :
- Ripple effect sur boutons (onde depuis point de clic)
- Haptic feedback sur mobile (si supporté)
- Son optionnel pour actions importantes (toggle dans settings)

=== ÉTATS VIDES (EMPTY STATES) ===

Designs cohérents :
- Illustration personnalisée (SVG animé ou image)
- Titre explicatif ("Aucun cours dans votre liste")
- Description contextuelle
- CTA principal clair
- CTA secondaire (optionnel)

Exemples :
- Aucun résultat : "Aucun cours trouvé" + "Réinitialiser les filtres"
- Pas de favoris : "Commencez à sauvegarder vos cours préférés"
- Pas de progression : "Commencez votre premier cours"
- Pas de cours inscrits : "Explorez les cours disponibles"

=== LOADING STATES ===

Hiérarchie :
1. Skeleton loaders (meilleur pour contenu répétitif)
2. Spinner centré (pour actions uniques)
3. Progress bar (pour uploads/téléchargements)
4. Skeleton + spinner (pour pages complètes)

Best practices :
- Skeleton doit ressembler au contenu final
- Durée max 2s avant timeout message
- Optimistic updates quand possible
- Cache pour éviter rechargements

=== ERREURS & VALIDATION ===

Messages d'erreur :
- Ton positif : "Veuillez entrer une adresse email valide" vs "Email invalide"
- Position : sous le champ concerné
- Icône d'erreur visible
- Exemple de format attendu si applicable
- Lien vers aide si erreur complexe

Validation :
- En temps réel (après blur ou 500ms d'inactivité)
- Indicateur visuel : rouge (erreur), vert (valide), gris (neutre)
- Compteur de caractères pour champs limités
- Force password visible (barre de force)

=== ACCESSIBILITÉ AVANCÉE ===

Navigation clavier :
- Focus trap dans modals
- Skip links : "Aller au contenu", "Aller à la navigation"
- Focus visible : ring 2px, offset 2px
- Ordre logique (tabindex)

Lecteurs d'écran :
- Landmarks ARIA (main, nav, aside, header, footer)
- Labels descriptifs (pas juste "Bouton")
- Live regions pour notifications
- Alt text descriptif (pas "image")

Contraste :
- Mode contraste élevé (option dans settings)
- Thème accessible (WCAG AAA si possible)
- Indicateurs non-solement colorés (icônes + texte)

=== RESPONSIVE OPTIMISATIONS ===

Mobile-first approach :
- Touch targets minimum 44x44px
- Espacement entre éléments cliquables (8px min)
- Swipe gestures : carrousels, navigation
- Bottom navigation sticky (fréquemment utilisées)
- Pull-to-refresh sur listes

Tablet :
- Layout hybride (pas juste mobile agrandi)
- Sidebar collapsible
- Multi-column où approprié

Desktop :
- Hover states activés
- Keyboard shortcuts complets
- Multi-select avec Ctrl/Cmd
- Drag & drop fonctionnel

=== PERSONNALISATION ===

Préférences utilisateur :
- Thème : Light, Dark, Auto (système)
- Densité : Compact, Comfortable, Spacious
- Animations : Toutes, Réduites, Aucune
- Police : Taille ajustable (16px base, ±4px)
- Langue : FR, EN, ES (avec détection auto)

Persistance :
- Sauvegarde dans localStorage
- Sync avec compte utilisateur (si connecté)
- Reset option disponible

=== GAMIFICATION UX ===

Éléments engageants :
- Streak counter : "X jours consécutifs"
- Badges avec animations au déblocage
- Leaderboard : top 10 hebdomadaire
- Niveaux : Débutant → Expert (barre XP)
- Achievements : "Premier cours complété", "100 heures", etc.

Affichage :
- Notifications toast pour nouveaux badges
- Page dédiée "Mes achievements"
- Partage sur réseaux sociaux
- Comparaison avec amis (optionnel, futur)

=== PERFORMANCE PERÇUE ===

Optimistic UI :
- Favoris : toggle instantané
- Progression : mise à jour locale avant sync
- Inscription : feedback immédiat

Progressive enhancement :
- Contenu visible immédiatement (SSR)
- Interactivité ajoutée après (hydration)
- Fallbacks gracieux si JS désactivé

Perceived performance :
- Skeleton loaders > spinners (semble plus rapide)
- Lazy loading images (viewport + 200px)
- Prefetch routes probables (hover sur liens)
- Service worker pour cache offline

=== TESTS UTILISATEURS ===

Métriques à suivre :
- Time to first interaction (TTI)
- Taux de rebond par page
- Taux d'inscription aux cours
- Taux de complétion cours
- Taux d'erreur formulaires
- Temps moyen par session
- Pages par session

A/B Testing :
- Variantes CTA (couleur, texte, position)
- Placement filtres (sidebar vs top)
- Design cartes cours (grid vs list)

=== DOCUMENTATION ===

Fichiers à maintenir :
- README.md : Setup, installation, scripts
- CONTRIBUTING.md : Guidelines de contribution
- API.md : Documentation des endpoints API
- COMPONENTS.md : Storybook ou doc composants
- DEPLOYMENT.md : Guide de déploiement
- CHANGELOG.md : Historique des versions
- UX_GUIDELINES.md : Design system et patterns UX

=== PROCHAINES ÉTAPES ===

Phase 1 (MVP) - ✅ Complété :
- Page d'accueil
- Catalogue de cours
- Détail cours
- Lecteur de cours
- Dashboard étudiant

Phase 2 (À implémenter) :
- Espace instructeur avancé
- Quiz interactifs
- Labs pratiques
- Certificats PDF

Phase 3 (Futur) :
- Mode hors-ligne (PWA)
- Chat en temps réel
- Sessions live
- Mobile app (React Native)
- API publique pour partenaires
