import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Users, Award, Globe, Target, Heart, Lightbulb, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-width-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              À propos d'Orange Digital Center Mali
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
              Orange Digital Center Mali est un nouveau concept dédié à l'accompagnement numérique et à l'innovation pour tous. 
              Il réunit dans un même lieu un ensemble de programmes tous gratuits, ouverts à tous, allant de la formation des jeunes 
              au numérique, en passant par l'accompagnement de porteurs de projets jusqu'à l'accélération de start-up et l'investissement dans ces dernières.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/courses">Explorer les cours</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/instructor/dashboard">Devenir instructeur</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">250K+</div>
              <div className="text-muted-foreground">Étudiants actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-muted-foreground">Cours disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">12,000+</div>
              <div className="text-muted-foreground">Instructeurs experts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">150+</div>
              <div className="text-muted-foreground">Pays représentés</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Notre Mission</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Booster l'employabilité et l'entrepreneuriat des jeunes au Mali ! Orange Digital Center Mali offre des formations 
              gratuites en développement web, mobile, design graphique, intelligence artificielle, IoT et bien plus encore. 
              Notre mission est de former la prochaine génération de talents numériques et de soutenir l'innovation technologique au Mali.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Formation Gratuite</h3>
              <p className="text-muted-foreground">
                Tous nos programmes sont 100% gratuits et ouverts à tous, sans condition de ressources financières.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accompagnement Complet</h3>
              <p className="text-muted-foreground">
                De la formation initiale à l'accélération de start-up, nous accompagnons les jeunes tout au long de leur parcours entrepreneurial.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation & Numérique</h3>
              <p className="text-muted-foreground">
                Formation aux dernières technologies : développement web/mobile, IA, IoT, design graphique et fabrication numérique.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Nos Valeurs</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Apprentissage continu</h3>
                  <p className="text-muted-foreground">
                    Nous encourageons une culture d'apprentissage tout au long de la vie, où chacun peut développer ses
                    compétences à son rythme.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Communauté</h3>
                  <p className="text-muted-foreground">
                    Nous créons une communauté d'apprenants et d'instructeurs qui se soutiennent mutuellement dans leur
                    parcours éducatif.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Diversité</h3>
                  <p className="text-muted-foreground">
                    Nous célébrons la diversité des perspectives, des cultures et des expériences qui enrichissent notre
                    plateforme.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Passion</h3>
                  <p className="text-muted-foreground">
                    Nous sommes passionnés par l'éducation et nous nous engageons à créer la meilleure expérience
                    d'apprentissage possible.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Impact</h3>
                  <p className="text-muted-foreground">
                    Nous mesurons notre succès par l'impact positif que nous avons sur la vie de nos étudiants et
                    instructeurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Nos Programmes</h2>
            <p className="text-lg text-muted-foreground">
              Orange Digital Center Mali propose une gamme complète de programmes de formation gratuits pour développer 
              les compétences numériques des jeunes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">École du Code</h3>
              <p className="text-muted-foreground">
                Formations intensives en développement web et mobile (React, Next.js, Flutter, Node.js, Angular) 
                sur 6 mois avec certification.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Formations Courtes</h3>
              <p className="text-muted-foreground">
                Bootcamps de 2-3 jours en design graphique (Canva), développement mobile (Flutter), 
                APIs REST, IoT et bien plus encore.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accompagnement Start-up</h3>
              <p className="text-muted-foreground">
                Accélération de start-up, accompagnement de porteurs de projets et investissement 
                dans les entreprises innovantes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Nous Contacter</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Orange Digital Center Mali - Bamako, Mali
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="https://ml.linkedin.com/company/orange-digital-center-mali" target="_blank" rel="noopener noreferrer">
                  Suivez-nous sur LinkedIn
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Découvrir nos cours</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Rejoignez Notre Communauté</h2>
            <p className="text-lg mb-8 opacity-90">
              Que vous soyez étudiant ou instructeur, rejoignez des milliers de personnes qui transforment leur avenir
              grâce à l'apprentissage en ligne.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/courses">Commencer à apprendre</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
