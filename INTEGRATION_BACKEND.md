# 🔗 Documentation d'Intégration Backend

Ce document décrit l'intégration du frontend avec le backend AWS.

## 📋 Vue d'ensemble

Le frontend est maintenant intégré avec le backend déployé sur AWS Elastic Beanstalk. Tous les appels API utilisent les endpoints réels au lieu des données mockées.

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_API_BASE_URL=http://odc-learning-backend-env.eba-ruizssvt.us-east-1.elasticbeanstalk.com/awsodclearning
```

Si la variable n'est pas définie, l'URL par défaut sera utilisée.

## 📁 Structure des fichiers API

```
lib/api/
├── config.ts          # Configuration et endpoints
├── client.ts          # Client API réutilisable avec gestion JWT
├── types.ts           # Types TypeScript correspondant aux modèles backend
├── adapters.ts        # Adaptateurs pour convertir backend → frontend
└── services.ts        # Services API (auth, courses, quiz, etc.)
```

## 🔐 Authentification

### Connexion

```typescript
import { useAuthStore } from "@/lib/store/auth-store"

const { login } = useAuthStore()

try {
  await login(email, password)
  // L'utilisateur est maintenant connecté
  // Le token JWT est automatiquement stocké
} catch (error) {
  // Gérer l'erreur
}
```

### Inscription

```typescript
const { register } = useAuthStore()

try {
  await register(name, email, password)
  // L'utilisateur est maintenant inscrit et connecté
} catch (error) {
  // Gérer l'erreur
}
```

### Déconnexion

```typescript
const { logout } = useAuthStore()
logout() // Supprime le token et déconnecte l'utilisateur
```

## 📚 Cours

### Obtenir tous les cours

```typescript
import { courseService } from "@/lib/api/services"

const courses = await courseService.getAllCourses()
```

### Obtenir un cours par ID

```typescript
const course = await courseService.getCourseById(courseId)
```

### Obtenir les cours par catégorie

```typescript
const courses = await courseService.getCoursesByCategory(categoryId)
```

### S'inscrire à un cours

```typescript
import { useCourseStore } from "@/lib/store/course-store"

const { enroll } = useCourseStore()

try {
  await enroll(courseId) // courseId est une string
  // L'utilisateur est maintenant inscrit au cours
} catch (error) {
  // Gérer l'erreur
}
```

## 🎯 Quiz

### Obtenir les quiz d'un cours

```typescript
import { quizService } from "@/lib/api/services"

const quizzes = await quizService.getQuizzesByCourse(courseId)
```

### Soumettre un quiz

```typescript
const submission = {
  quizId: 1,
  answers: [
    {
      questionId: 1,
      reponseIds: [1, 2], // Pour QCM
      texteReponse: "Réponse texte" // Pour questions texte
    }
  ]
}

const response = await quizService.submitQuiz(submission)
```

## 🧪 Labs

### Obtenir tous les labs

```typescript
import { labService } from "@/lib/api/services"

const labs = await labService.getAllLabs()
```

### Démarrer un lab

```typescript
const response = await labService.startLab(labId)
// Retourne une LabSession avec containerUrl
```

### Arrêter un lab

```typescript
const response = await labService.stopLab(sessionId)
```

### Soumettre un lab

```typescript
const response = await labService.submitLab(sessionId, {
  reportUrl: "https://..."
})
```

## 📊 Dashboard

### Obtenir les statistiques

```typescript
import { dashboardService } from "@/lib/api/services"

const stats = await dashboardService.getSummary()
// Retourne DashboardStatsDTO avec coursesJoined, certificatesObtained, etc.
```

## 🔄 Adaptateurs

Les adaptateurs convertissent automatiquement les modèles backend vers les modèles frontend :

- `BackendCourse` → `Course`
- `BackendUser` → `User`
- `QuizDTO` → `Quiz`
- `LabDefinition` → `Lab`

## 🔑 Gestion des tokens JWT

Le client API gère automatiquement les tokens JWT :

- Le token est stocké dans `localStorage` sous la clé `auth_token`
- Le token est automatiquement inclus dans les headers `Authorization: Bearer <token>`
- Le token est supprimé lors de la déconnexion

## 📝 Endpoints disponibles

Voir la documentation Swagger complète :
- Swagger UI: http://odc-learning-backend-env.eba-ruizssvt.us-east-1.elasticbeanstalk.com/awsodclearning/swagger-ui/index.html
- API Base: http://odc-learning-backend-env.eba-ruizssvt.us-east-1.elasticbeanstalk.com/awsodclearning

## ⚠️ Notes importantes

1. **Authentification requise** : La plupart des endpoints nécessitent un token JWT valide
2. **Gestion des erreurs** : Tous les services retournent un `ApiResponse<T>` avec `ok`, `ko`, `message`
3. **Types** : Les IDs backend sont des `number`, les IDs frontend sont des `string`
4. **Images** : Les chemins d'images du backend doivent être complétés avec l'URL de base si nécessaire

## 🚀 Prochaines étapes

Pour utiliser l'API dans vos composants :

1. Importer les services nécessaires depuis `@/lib/api/services`
2. Utiliser les stores Zustand pour l'état local (auth, courses)
3. Utiliser React Query si nécessaire pour le cache et la synchronisation





