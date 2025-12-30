import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Download, MessageCircle, Search } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Comment pouvons-nous vous aider ?</h1>
          <p className="text-muted-foreground mb-8">Trouvez rapidement les réponses à vos questions</p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input placeholder="Rechercher une question..." className="pl-10 h-12" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <BookOpen className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Commencer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comment créer un compte, naviguer sur la plateforme et commencer votre premier cours
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <BookOpen className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Accès aux cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comment accéder à vos cours et gérer votre progression
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Download className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Certificats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comment obtenir et télécharger vos certificats de complétion
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-3xl font-bold mb-8">Questions Fréquentes</h2>

        <div className="space-y-6 mb-16">
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Comment créer un compte sur Orange Digital Learning ?</AccordionTrigger>
                  <AccordionContent>
                    Cliquez sur le bouton "S'inscrire" en haut à droite de la page. Remplissez le formulaire avec votre
                    nom, email et mot de passe. Vous recevrez un email de confirmation pour activer votre compte.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Puis-je télécharger les cours pour les regarder hors ligne ?</AccordionTrigger>
                  <AccordionContent>
                    Certains cours offrent la possibilité de télécharger les ressources et documents, mais les vidéos ne
                    sont disponibles qu'en streaming pour des raisons de sécurité du contenu.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Puis-je annuler mon inscription à un cours ?</AccordionTrigger>
                  <AccordionContent>
                    Oui, vous pouvez annuler votre inscription à un cours à tout moment depuis votre profil. Vous conserverez l'accès aux contenus déjà complétés et pourrez reprendre votre progression plus tard.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Les cours ont-ils une date d'expiration ?</AccordionTrigger>
                  <AccordionContent>
                    Non, une fois que vous vous êtes inscrit à un cours, vous y avez accès à vie. Vous pouvez le suivre à votre
                    rythme et y revenir autant de fois que vous le souhaitez.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Comment obtenir un certificat de complétion ?</AccordionTrigger>
                  <AccordionContent>
                    Vous recevez automatiquement un certificat de complétion une fois que vous avez terminé 100% d'un
                    cours. Le certificat est disponible en téléchargement dans votre profil.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>Puis-je devenir formateur sur Orange Digital Learning ?</AccordionTrigger>
                  <AccordionContent>
                    Oui ! Cliquez sur "Devenir Formateur" dans le menu principal. Vous devrez remplir un formulaire de
                    candidature et notre équipe vous contactera dans les 48 heures.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-2">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">Vous ne trouvez pas votre réponse ?</h3>
            <p className="text-muted-foreground mb-6">Notre équipe de support est là pour vous aider 7j/7</p>
            <Link href="/contact">
              <Button size="lg">Contacter le support</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
