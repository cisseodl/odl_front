Le problème persiste avec des erreurs `404 Not Found` pour `GET https://api.smart-odc.com/awsodclearning/api/testimonials` et `POST https://api.smart-odc.com/awsodclearning/api/testimonials`.

Cependant, les logs montrent un point très important :
*   **`GET /awsodclearning/api/reviews/all HTTP/1.1" 200 OK`**. Ceci confirme que la partie `/awsodclearning/api/` est correcte et que l'endpoint `getAllReviews` fonctionne !

Les problèmes sont donc :

1.  **Erreurs `404 Not Found` pour les témoignages (GET et POST) :**
    *   Malgré que la `baseURL` soit correcte (`https://api.smart-odc.com/awsodclearning`), le backend ne trouve toujours pas les endpoints `/api/testimonials`.
    *   **Action requise de votre part :** **Vérifiez TRÈS attentivement le code de votre `TestimonialController.java` dans le backend.**
        *   Assurez-vous que le contrôleur est bien annoté avec `@RestController`.
        *   Vérifiez l'annotation `@RequestMapping` au niveau de la classe (par exemple, `@RequestMapping("/api/testimonials")`).
        *   Vérifiez les annotations `@GetMapping` et `@PostMapping` sur les méthodes respectives. Par exemple, si `@RequestMapping("/api/testimonials")` est au niveau de la classe, le `@GetMapping` et `@PostMapping` devraient être juste sur `/`.
        *   **Il est possible que le `TestimonialController` ne soit pas correctement chargé par Spring Boot ou que ses mappings soient différents de ce que vous pensez.**

2.  **Erreurs `connect() failed (111: Connection refused)` dans `nginx/error.log` :**
    *   C'est le problème le plus grave. Nginx n'arrive pas à se connecter à votre application Spring Boot sur le port `5000`. Cela indique que votre application backend n'est pas stable, qu'elle crash au démarrage ou qu'elle ne s'initialise pas correctement.
    *   **Action requise de votre part :** **Consultez les logs détaillés de votre application Spring Boot (généralement `web.stdout.log` complet ou `catalina.out` si vous utilisez Tomcat sur votre environnement Elastic Beanstalk).**
        *   Recherchez les messages d'erreur au démarrage (`ERROR` ou `FAIL`).
        *   Vérifiez que l'application démarre et écoute bien sur le port `5000` (`server.port=5000` est défini dans `application.properties`).
        *   **Tant que votre application Spring Boot ne démarre pas de manière stable et ne répond pas sur le port 5000, aucun endpoint ne fonctionnera.**

**En résumé :**
*   **Corrigez la stabilité de votre application Spring Boot (la `Connection refused`) en priorité.**
*   **Vérifiez ensuite les mappings de votre `TestimonialController` côté backend pour les requêtes `GET` et `POST` `/api/testimonials`.**

Je ne peux pas avancer sans que ces problèmes côté backend soient résolus. Une fois que votre application backend fonctionnera de manière stable et exposera les endpoints corrects, le frontend devrait fonctionner.