import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : Mars 2024</p>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">1. Acceptation des conditions</h2>
              <p className="text-muted-foreground leading-relaxed">
                En accédant et en utilisant Orange Digital Learning, vous acceptez d'être lié par ces conditions générales
                d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">2. Utilisation de la plateforme</h2>
              <p className="text-muted-foreground leading-relaxed">
                Orange Digital Learning vous accorde une licence limitée, non exclusive et non transférable pour accéder et utiliser
                notre plateforme à des fins personnelles et non commerciales.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Vous devez avoir au moins 16 ans pour créer un compte</li>
                <li>Vous êtes responsable de la confidentialité de votre compte</li>
                <li>Vous ne pouvez pas partager votre accès aux cours avec d'autres personnes</li>
                <li>Vous ne pouvez pas télécharger ou redistribuer le contenu des cours</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">3. Contenu des cours</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tout le contenu disponible sur Orange Digital Learning, y compris les vidéos, textes, images et autres matériaux, est
                protégé par les droits d'auteur et appartient à Orange Digital Learning ou à ses formateurs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">4. Inscription et accès aux cours</h2>
              <p className="text-muted-foreground leading-relaxed">
                L'inscription aux cours sur Orange Digital Learning vous donne un accès à vie au contenu. Vous pouvez suivre les cours à votre rythme et y revenir autant de fois que nécessaire. Vous pouvez annuler votre inscription à tout moment depuis votre profil.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">5. Limitation de responsabilité</h2>
              <p className="text-muted-foreground leading-relaxed">
                Orange Digital Learning ne peut être tenu responsable des dommages directs, indirects, accessoires ou consécutifs
                résultant de l'utilisation ou de l'impossibilité d'utiliser notre plateforme.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">6. Modifications des conditions</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entreront en
                vigueur immédiatement après leur publication sur la plateforme.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
