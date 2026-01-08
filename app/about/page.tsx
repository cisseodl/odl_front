import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Users, Award, Globe, Target, Heart, Lightbulb, TrendingUp, GraduationCap, Rocket, Wrench, Video } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance text-center">
              À propos
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl text-pretty">
              Orange Digital Learning (ODL) est une initiative de Orange Digital Center Mali (ODC-Mali) qui est un écosystème numérique complet dédié à l'accompagnement et à l'innovation pour tous.
              ODC-Mali réunit quatre programmes complémentaires et gratuits :
              <strong> Orange Digital Kalanso</strong> (école du code),
              <strong> FabLab Solidaire</strong> (atelier de fabrication numérique),
              <strong> Multimédia</strong> (centre de production et formation) et
              <strong> Orange Fab</strong> (accélérateur de start-up).
              Tous ces programmes sont gratuits et sont ouverts à tous.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/courses">Explorer les cours</Link>
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
              <div className="text-muted-foreground">Formateurs experts</div>
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
              <strong>Notre raison d'être est de booster l'employabilité et l'entrepreneuriat des jeunes maliens à travers nos programmes spéciaux.</strong>
            </p>
            <p className="text-lg text-muted-foreground text-pretty mt-4">
              Nous offrons un écosystème complet qui transforme les jeunes en acteurs du numérique et de l'innovation au Mali,
              en leur donnant accès à des formations gratuites, un accompagnement personnalisé et les outils nécessaires pour réussir
              dans le monde numérique.
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
                    Nous créons une communauté d'apprenants et de formateurs qui se soutiennent mutuellement dans leur
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
                    formateurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section - Les 4 Piliers d'ODC */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Les 4 Piliers d'Orange Digital Center</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Découvrez les quatre programmes complémentaires qui font d'ODC un écosystème numérique complet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Orange Digital Kalanso */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-green-700">Orange Digital Kalanso</h3>
                  <p className="text-sm font-semibold text-green-600 mb-4">École de code</p>
                  <p className="text-muted-foreground mb-4 text-pretty">
                    Orange Digital Kalanso est notre école de programmation qui forme les jeunes aux métiers du numérique.
                    Nous proposons des formations intensives et gratuites en développement web et mobile, couvrant les technologies
                    les plus demandées sur le marché.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Formations proposées :</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Développement Web (React, Next.js, Angular, Node.js)</li>
                      <li>Développement Mobile (Flutter, React Native)</li>
                      <li>Formations intensives de 6 mois avec certification</li>
                      <li>Bootcamps courts de 2-3 jours sur des technologies spécifiques</li>
                      <li>Projets pratiques et accompagnement personnalisé</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Orange Fab */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-purple-700">Orange Fab</h3>
                  <p className="text-sm font-semibold text-purple-600 mb-4">Accélérateur de start-up</p>
                  <p className="text-muted-foreground mb-4 text-pretty">
                    Orange Fab est notre programme d'accélération dédié aux start-up innovantes. Nous accompagnons les entrepreneurs
                    dans le développement de leur projet, de l'idée initiale jusqu'à la mise sur le marché, en leur offrant des ressources,
                    un mentorat expert et un réseau de partenaires.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Services offerts :</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Accompagnement personnalisé par des mentors experts</li>
                      <li>Accès à un réseau de partenaires et investisseurs</li>
                      <li>Workshops et formations en entrepreneuriat</li>
                      <li>Espace de coworking et ressources techniques</li>
                      <li>Mise en relation avec le marché et opportunités business</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* FabLab Solidaire */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-8 h-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-gray-700">FabLab Solidaire</h3>
                  <p className="text-sm font-semibold text-gray-600 mb-4">Atelier de fabrication numérique</p>
                  <p className="text-muted-foreground mb-4 text-pretty">
                    Le FabLab Solidaire est un espace de fabrication numérique ouvert à tous, où les jeunes peuvent donner vie à leurs
                    idées créatives. Équipé d'imprimantes 3D, de découpeuses laser et d'autres outils numériques, c'est le lieu idéal
                    pour prototyper, créer et innover.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Équipements et services :</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Imprimantes 3D pour prototypage rapide</li>
                      <li>Découpeuses laser et vinyle</li>
                      <li>Équipements électroniques (Arduino, Raspberry Pi)</li>
                      <li>Formations à la fabrication numérique</li>
                      <li>Espace collaboratif pour projets innovants</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Multimédias */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Video className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-blue-700">Multimédias</h3>
                  <p className="text-sm font-semibold text-blue-600 mb-4">Centre de production et formation multimédia</p>
                  <p className="text-muted-foreground mb-4 text-pretty">
                    Le programme Multimédias d'Orange Digital Center offre des formations et des ressources pour la création de contenu
                    numérique. Que ce soit pour la vidéo, le design graphique, le montage ou la photographie, nous formons les jeunes
                    aux compétences multimédias essentielles pour l'ère digitale.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Domaines couverts :</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Production vidéo et montage (Premiere Pro, DaVinci Resolve)</li>
                      <li>Design graphique (Photoshop, Illustrator, Canva)</li>
                      <li>Photographie numérique et retouche</li>
                      <li>Animation et motion design</li>
                      <li>Podcasting et création audio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Synthèse Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Un Écosystème Complet</h3>
                <p className="text-lg text-muted-foreground text-pretty mb-6">
                  Ces quatre programmes travaillent en synergie pour offrir un parcours complet aux jeunes maliens :
                  de la formation technique (Kalanso) à la création de contenu (Multimédias), en passant par le prototypage
                  (FabLab) et l'entrepreneuriat (Orange Fab). Ensemble, ils forment un écosystème numérique solide qui
                  transforme les idées en réalité et les compétences en opportunités professionnelles.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/courses">Découvrir nos formations</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/contact">Nous rejoindre</Link>
                  </Button>
                </div>
              </div>
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
              Que vous soyez étudiant ou formateur, rejoignez des milliers de personnes qui transforment leur avenir
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
