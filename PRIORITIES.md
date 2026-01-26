# Documentation des Endpoints API

## Endpoint pour donner des avis

### POST /api/courses/{courseId}/reviews

*   **Description :** Permet à un utilisateur authentifié d'ajouter une critique (note et commentaire) pour un cours spécifique.
*   **Méthode HTTP :** `POST`
*   **URL des exemples :**
    *   `POST /api/courses/123/reviews?rating=5&comment=Excellent%20cours%20!`
*   **Path Variable :**
    *   `courseId` (Type: `Long`) : L'identifiant unique du cours concerné.
*   **Paramètres de requête (`@RequestParam`) :**
    *   `rating` (Type: `Integer`) : La note donnée au cours (par exemple, de 1 à 5).
    *   `comment` (Type: `String`) : Le texte de l'avis.
*   **Authentification :** Requiert un utilisateur authentifié.
*   **Exemple de requête (les paramètres sont passés dans l'URL) :**

    ```
    POST /api/courses/42/reviews?rating=4&comment=Bon%20contenu%20mais%20quelques%20points%20à%20améliorer.
    ```
