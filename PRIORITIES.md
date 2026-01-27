VM358 b95ff219e02d2814.js:1 [ModuleLessonFormModal] handleSubmit appelé avec: {courseId: 1, title: 'Notion de Component ( les bases )', moduleOrder: 1, lessons: Array(1)}
VM358 b95ff219e02d2814.js:1 [ModuleLessonFormModal] Début de l'upload des fichiers...
VM358 b95ff219e02d2814.js:1 [ModuleLessonFormModal] Traitement de la leçon 0: {title: 'Component Column', lessonOrder: 1, type: 'DOCUMENT', contentUrl: 'Cahier_des_Charges_Site_Ecommerce.pdf', contentFile: File, …}
VM358 b95ff219e02d2814.js:1 [ModuleLessonFormModal] Upload du fichier pour la leçon 0 dans le dossier: documents
VM344 279d96e1e4e094d4.js:1 [FileUploadService] uploadFile appelé - fichier: Cahier_des_Charges_Site_Ecommerce.pdf, taille: 3386, type: application/pdf, dossier: documents
VM344 279d96e1e4e094d4.js:1 [FileUploadService] Token présent: true
VM344 279d96e1e4e094d4.js:1 [FileUploadService] URL complète: https://api.smart-odc.com/awsodclearning/api/files/upload
VM344 279d96e1e4e094d4.js:1 [FileUploadService] Réponse reçue - Status: 200, OK: true
VM344 279d96e1e4e094d4.js:1 [FileUploadService] Réponse JSON complète: {data: 'https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769553805485.pdf', message: 'Upload réussi', success: true, failed: false}
VM344 279d96e1e4e094d4.js:1 [FileUploadService] URL extraite: https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769553805485.pdf
VM344 279d96e1e4e094d4.js:1 [FileUploadService] Upload réussi, URL finale: https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769553805485.pdf
VM358 b95ff219e02d2814.js:1 [ModuleLessonFormModal] Fichier uploadé avec succès, URL: https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769553805485.pdf
VM358 b95ff219e02d2814.js:1 [ModuleLessonFormModal] Tous les fichiers uploadés, préparation du payload final
VM358 b95ff219e02d2814.js:1 [ModuleLessonFormModal] Appel de onSubmit avec: {courseId: 1, title: 'Notion de Component ( les bases )', moduleOrder: 1, lessons: Array(1)}
VM344 279d96e1e4e094d4.js:1 [ModuleService] saveModules appelé avec payload: {courseId: 1, courseType: 'DEBUTANT', modules: Array(1)}
VM344 279d96e1e4e094d4.js:1 [ModuleService] JSON stringifié: {"courseId":1,"courseType":"DEBUTANT","modules":[{"title":"Notion de Component ( les bases )","description":"","moduleOrder":1,"lessons":[{"title":"Component Column","lessonOrder":1,"type":"DOCUMENT","contentUrl":"https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769553805485.pdf","duration":34}]}]}
VM344 279d96e1e4e094d4.js:1 [ModuleService] FormData créé, appel de fetchApi vers /modules/save
VM344 279d96e1e4e094d4.js:1 [ModuleService] Réponse reçue du backend: {data: null, message: "Erreur d'enregistrement des modules/leçons : could…ntViolationException: could not execute statement", success: false, failed: true}
VM358 b95ff219e02d2814.js:1 [ModuleLessonFormModal] onSubmit terminé avec succès
