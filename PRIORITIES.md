## Endpoint pour la soumission de Témoignages

### POST /api/testimonials

*   **Description :** Permet à un utilisateur authentifié de soumettre un témoignage pour la plateforme.
*   **Méthode HTTP :** `POST`
*   **URL de l'endpoint :** `/api/testimonials`
*   **Corps de la requête (Request Body - JSON) :**
    ```json
    {
      "content": "Votre témoignage ici..."
    }
    ```
    *   `content` (Type: `String`) : Le texte du témoignage.
*   **Réponse en cas de succès (200 OK) :** `CResponse<TestimonialResponse>`
    *   Retourne les détails du témoignage soumis.
*   **Codes d'erreur possibles :**
    *   `400 Bad Request` : Si le `content` est vide ou ne respecte pas les règles de validation.
    *   `401 Unauthorized` : Si l'utilisateur n'est pas authentifié.
*   **Authentification :** Requiert un utilisateur authentifié (`@PreAuthorize("isAuthenticated()")`).

### GET /api/testimonials

*   **Description :** Permet de récupérer tous les témoignages soumis.
*   **Méthode HTTP :** `GET`
*   **URL de l'endpoint :** `/api/testimonials`
*   **Authentification :** Non spécifié, mais souvent pour les utilisateurs authentifiés, ou peut être public. (Dans l'implémentation, il n'y a pas de `@PreAuthorize` donc il est public si la configuration globale l'autorise ou authentifié par `anyRequest().authenticated()` s'il n'est pas dans `permitAll`).
*   **Réponse (200 OK) :** `CResponse<List<TestimonialResponse>>`
    *   Retourne une liste d'objets `TestimonialResponse`.

### GET /api/testimonials/user/{userId}

*   **Description :** Permet de récupérer tous les témoignages soumis par un utilisateur spécifique.
*   **Méthode HTTP :** `GET`
*   **URL des exemples :**
    *   `GET /api/testimonials/user/123`
*   **Path Variable :**
    *   `userId` (Type: `Long`) : L'identifiant unique de l'utilisateur dont on veut récupérer les témoignages.
*   **Authentification :** Non spécifié. (Dans l'implémentation, il n'y a pas de `@PreAuthorize` donc il est public si la configuration globale l'autorise ou authentifié par `anyRequest().authenticated()` s'il n'est pas dans `permitAll`).
*   **Réponse (200 OK) :** `CResponse<List<TestimonialResponse>>`
    *   Retourne une liste d'objets `TestimonialResponse`.

---