 form field element should have an id or name attribute
A form field element has neither an id nor a name attribute. This might prevent the browser from correctly autofilling the form.

To fix this issue, add a unique id or name attribute to a form field. This is not strictly needed, but still recommended even if you have an autocomplete attribute on the same element.

3 resources
Learn more: The form input element
Incorrect use of <label for=FORM_ELEMENT>
The label's for attribute doesn't match any element id. This might prevent the browser from correctly autofilling the form and accessibility tools from working correctly.

To fix this issue, make sure the label's for attribute references the correct id of a form field.

2 resources
Violating node
Violating node
Learn more: The label elements



duleLessonFormModal] handleSubmit appelé avec: {courseId: 2, title: 'Notion de base Amplify', moduleOrder: 1, lessons: Array(1)}
b95ff219e02d2814.js:1 [ModuleLessonFormModal] Début de l'upload des fichiers...
b95ff219e02d2814.js:1 [ModuleLessonFormModal] Traitement de la leçon 0: {title: 'Amplify 2', lessonOrder: 1, type: 'DOCUMENT', contentUrl: 'Cahier_des_Charges_Site_Ecommerce.pdf', contentFile: File, …}
b95ff219e02d2814.js:1 [ModuleLessonFormModal] Upload du fichier pour la leçon 0 dans le dossier: documents
279d96e1e4e094d4.js:1 [FileUploadService] uploadFile appelé - fichier: Cahier_des_Charges_Site_Ecommerce.pdf, taille: 3386, type: application/pdf, dossier: documents
279d96e1e4e094d4.js:1 [FileUploadService] Token présent: true
279d96e1e4e094d4.js:1 [FileUploadService] URL complète: https://api.smart-odc.com/awsodclearning/api/files/upload
279d96e1e4e094d4.js:1 [FileUploadService] Réponse reçue - Status: 200, OK: true
279d96e1e4e094d4.js:1 [FileUploadService] Réponse JSON complète: {data: 'https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769524565861.pdf', message: 'Upload réussi', success: true, failed: false}
279d96e1e4e094d4.js:1 [FileUploadService] URL extraite: https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769524565861.pdf
279d96e1e4e094d4.js:1 [FileUploadService] Upload réussi, URL finale: https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769524565861.pdf
b95ff219e02d2814.js:1 [ModuleLessonFormModal] Fichier uploadé avec succès, URL: https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769524565861.pdf
b95ff219e02d2814.js:1 [ModuleLessonFormModal] Tous les fichiers uploadés, préparation du payload final
b95ff219e02d2814.js:1 [ModuleLessonFormModal] Appel de onSubmit avec: {courseId: 2, title: 'Notion de base Amplify', moduleOrder: 1, lessons: Array(1)}
279d96e1e4e094d4.js:1 [ModuleService] saveModules appelé avec payload: {courseId: 2, courseType: 'INTERMEDIAIRE', modules: Array(1)}
279d96e1e4e094d4.js:1 [ModuleService] JSON stringifié: {"courseId":2,"courseType":"INTERMEDIAIRE","modules":[{"title":"Notion de base Amplify","description":"","moduleOrder":1,"lessons":[{"title":"Amplify 2","lessonOrder":1,"type":"DOCUMENT","contentUrl":"https://odl-learning-assets-prod.s3.us-east-1.amazonaws.com/documents/1769524565861.pdf","duration":22}]}]}
279d96e1e4e094d4.js:1 [ModuleService] FormData créé, appel de fetchApi vers /modules/save
279d96e1e4e094d4.js:1 [ModuleService] Réponse reçue du backend: {data: null, message: "Erreur d'enregistrement des modules/leçons : could…ntViolationException: could not execute statement", success: false, failed: true}data: nullfailed: truemessage: "Erreur d'enregistrement des modules/leçons : could not execute statement; SQL [n/a]; constraint [null]; nested exception is org.hibernate.exception.ConstraintViolationException: could not execute statement"success: false[[Prototype]]: Object
b95ff219e02d2814.js:1 [ModuleLessonFormModal] onSubmit terminé avec succès
0caae56376e993bd.js:1 Déconnexion automatique après 1 minute d'inactivité