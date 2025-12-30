import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : Mars 2024</p>

        <div className="space-y-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">1. Collecte des données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous collectons les informations que vous nous fournissez directement lors de la création de votre
                compte, de l'achat de cours ou de l'utilisation de nos services.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Informations d'identification (nom, email, mot de passe)</li>
                <li>Informations de paiement (traitées de manière sécurisée par nos partenaires)</li>
                <li>Données d'utilisation (cours suivis, progression, temps passé)</li>
                <li>Données techniques (adresse IP, type de navigateur, système d'exploitation)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">2. Utilisation des données</h2>
              <p className="text-muted-foreground leading-relaxed">Nous utilisons vos données personnelles pour :</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience d'apprentissage</li>
                <li>Traiter vos paiements et prévenir la fraude</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Analyser l'utilisation de la plateforme</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">3. Partage des données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans
                les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Avec les formateurs des cours que vous suivez (statistiques anonymisées)</li>
                <li>Avec nos prestataires de services (hébergement, paiement, analytics)</li>
                <li>Si requis par la loi ou dans le cadre d'une procédure judiciaire</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">4. Sécurité des données</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger
                vos données personnelles contre la perte, l'utilisation abusive et l'accès non autorisé.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">5. Vos droits</h2>
              <p className="text-muted-foreground leading-relaxed">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification de vos données</li>
                <li>Droit à l'effacement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
                <li>Droit d'opposition au traitement de vos données</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">6. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience sur notre plateforme. Vous pouvez configurer
                votre navigateur pour refuser les cookies, mais cela peut affecter certaines fonctionnalités.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">7. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits,
                contactez-nous à : privacy@orangedigitallearning.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
