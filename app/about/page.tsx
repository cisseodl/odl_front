"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Globe,
  Heart,
  TrendingUp,
  GraduationCap,
  Rocket,
  Wrench,
  Video,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  rubriqueService,
  dashboardService,
} from "@/lib/api/services";
import { AnimatedStats } from "@/components/animated-stats";
import Image from "next/image";

// AJOUTER: Import manquant de FadeInView
import { FadeInView } from "@/components/fade-in-view";

export default function HomePage() {
  // Charger les rubriques depuis l'API
  const { data: rubriques = [], isLoading: isLoadingRubriques } = useQuery({
    queryKey: ["rubriques"],
    queryFn: async () => {
      const data = await rubriqueService.getAllRubriques();
      // Debug: vérifier la structure des données
      if (data && data.length > 0) {
        console.log("Rubriques chargées:", data);
        console.log("Première rubrique:", data[0]);
        console.log(
          "Image de la première rubrique:",
          data[0]?.image || data[0]?.imageUrl,
        );
      }
      return data;
    },
    staleTime: 10 * 60 * 1000, // Cache pendant 10 minutes
  });



  // Charger les statistiques publiques
  const { data: publicStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["publicStats"],
    queryFn: async () => {
      const stats = await dashboardService.getPublicStats();
      return stats;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - les stats changent moins souvent
  });



  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section - Style Orange Mali Impactant */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 text-balance">
              <strong className="text-primary">Orange</strong>{" "}
              <strong>Digital Learning</strong>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-center">
              Plateforme d'Autoformation E-Learning
            </p>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl text-justify">
              une initiative de <strong className="text-primary">Orange</strong>{" "}
              <strong>Digital Center Mali (ODC-Mali)</strong> qui est un
              écosystème numérique complet dédié à l'accompagnement et à
              l'innovation pour tous. ODC-Mali réunit quatre programmes
              complémentaires et gratuits :
              <strong> Orange Digital Kalanso</strong> (école du code),
              <strong> FabLab Solidaire</strong> (atelier de fabrication
              numérique),
              <strong> ODC Multimédia</strong> (centre de production et
              formation) et
              <strong> Orange Fab</strong> (accélérateur de start-up). Tous ces
              programmes sont gratuits et sont ouverts à tous.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/courses">Explorer les cours</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          {isLoadingStats ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex justify-center">
              <AnimatedStats
                stats={[
                  {
                    value: publicStats?.totalStudents ?? 0,
                    label: "Étudiants actifs",
                    useFormat: true,
                  },
                  {
                    value: publicStats?.totalCourses ?? 0,
                    label: "Cours disponibles",
                    useFormat: true,
                  },
                  {
                    value: publicStats?.totalInstructors ?? 0,
                    label: "Formateurs experts",
                    useFormat: true,
                  },
                ]}
              />
            </div>
          )}
        </div>
      </section>




      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Nos Valeurs
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Apprentissage continu
                  </h3>
                  <p className="text-muted-foreground">
                    Nous encourageons une culture d'apprentissage tout au long
                    de la vie, où chacun peut développer ses compétences à son
                    rythme.
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
                    Nous créons une communauté d'apprenants et de formateurs qui
                    se soutiennent mutuellement dans leur parcours éducatif.
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
                    Nous célébrons la diversité des perspectives, des cultures
                    et des expériences qui enrichissent notre plateforme.
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
                    Nous sommes passionnés par l'éducation et nous nous
                    engageons à créer la meilleure expérience d'apprentissage
                    possible.
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
                    Nous mesurons notre succès par l'impact positif que nous
                    avons sur la vie de nos étudiants et formateurs.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Les 4 Piliers d'Orange Digital Center
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Découvrez les quatre programmes complémentaires qui font d'ODC un
              écosystème numérique complet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {isLoadingRubriques ? (
              <div className="col-span-2 flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : rubriques.length === 0 ? (
              <div className="col-span-2 text-center text-muted-foreground py-12">
                Aucune rubrique disponible pour le moment.
              </div>
            ) : (
              rubriques.map((rubrique: any) => {
                // Déterminer la couleur selon le nom de la rubrique
                const getColorClass = (rubriqueName: string) => {
                  const name = rubriqueName?.toLowerCase() || "";
                  if (name.includes("kalanso"))
                    return {
                      bg: "bg-green-500/10",
                      text: "text-green-600",
                      title: "text-green-700",
                      subtitle: "text-green-600",
                    };
                  if (name.includes("fab"))
                    return {
                      bg: "bg-purple-500/10",
                      text: "text-purple-600",
                      title: "text-purple-700",
                      subtitle: "text-purple-600",
                    };
                  if (name.includes("fablab") || name.includes("solidaire"))
                    return {
                      bg: "bg-gray-500/10",
                      text: "text-gray-600",
                      title: "text-gray-700",
                      subtitle: "text-gray-600",
                    };
                  if (
                    name.includes("multimedia") ||
                    name.includes("multimédia")
                  )
                    return {
                      bg: "bg-blue-500/10",
                      text: "text-blue-600",
                      title: "text-blue-700",
                      subtitle: "text-blue-600",
                    };
                  return {
                    bg: "bg-primary/10",
                    text: "text-primary",
                    title: "text-primary",
                    subtitle: "text-primary",
                  };
                };

                const colors = getColorClass(rubrique.rubrique);

                // Vérifier si l'image existe et est valide
                const imageUrl = rubrique.image || rubrique.imageUrl || null;

                return (
                  <Card
                    key={rubrique.id}
                    className="p-8 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-6">
                      {/* Image de la rubrique à la place de l'icône */}
                      <div
                        className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative`}
                      >
                        {imageUrl ? (
                          <>
                            <Image
                              src={imageUrl}
                              alt={rubrique.rubrique || "Rubrique"}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                // Si l'image ne charge pas, masquer l'erreur et afficher l'icône par défaut
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  e.currentTarget.style.display = "none";
                                  const fallback =
                                    parent.querySelector(".image-fallback");
                                  if (fallback) {
                                    (fallback as HTMLElement).style.display =
                                      "flex";
                                  }
                                }
                              }}
                            />
                            <div className="image-fallback hidden absolute inset-0 items-center justify-center">
                              <GraduationCap
                                className={`w-8 h-8 ${colors.text}`}
                              />
                            </div>
                          </>
                        ) : (
                          <GraduationCap className={`w-8 h-8 ${colors.text}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`text-2xl font-bold mb-3 ${colors.title}`}
                        >
                          {rubrique.rubrique || "Rubrique"}
                        </h3>
                        {rubrique.publicCible && (
                          <p
                            className={`text-sm font-semibold ${colors.subtitle} mb-4`}
                          >
                            {rubrique.publicCible}
                          </p>
                        )}
                        {rubrique.description && (
                          <p className="text-muted-foreground mb-4 text-pretty">
                            {rubrique.description}
                          </p>
                        )}
                        {rubrique.formationsProposees && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">
                              Formations proposées :
                            </p>
                            <div
                              className="text-sm text-muted-foreground space-y-1"
                              dangerouslySetInnerHTML={{
                                __html: rubrique.formationsProposees.replace(
                                  /\n/g,
                                  "<br />",
                                ),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Synthèse Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Un Écosystème Complet
                </h3>
                <p className="text-lg text-muted-foreground text-pretty mb-6">
                  Ces quatre programmes travaillent en synergie pour offrir un
                  parcours complet aux jeunes maliens : de la formation
                  technique (Kalanso) à la création de contenu (Multimédias), en
                  passant par le prototypage (FabLab) et l'entrepreneuriat
                  (Orange Fab). Ensemble, ils forment un écosystème numérique
                  solide qui transforme les idées en réalité et les compétences
                  en opportunités professionnelles.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nous Contacter
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Orange Digital Center Mali - Bamako, Mali
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <Button size="lg" asChild>
                <a
                  href="https://ml.linkedin.com/company/orange-digital-center-mali"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Suivez-nous sur LinkedIn
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Découvrir nos cours</Link>
              </Button>
            </div>

            {/* Social Media Links */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-12 w-12 rounded-full border-2 hover:border-primary hover:text-primary transition-colors"
              >
                <a
                  href="https://www.facebook.com/ODCMali"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-12 w-12 rounded-full border-2 hover:border-primary hover:text-primary transition-colors"
              >
                <a
                  href="https://www.linkedin.com/company/orange-digital-center-mali/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-12 w-12 rounded-full border-2 hover:border-primary hover:text-primary transition-colors"
              >
                <a
                  href="https://x.com/ODC_Mali?s=20"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-6 w-6" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                className="h-12 w-12 rounded-full border-2 hover:border-primary hover:text-primary transition-colors"
              >
                <a
                  href="https://www.instagram.com/odc_mali/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Rejoignez Notre Communauté
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Que vous soyez étudiant ou formateur, rejoignez des milliers de
              personnes qui transforment leur avenir grâce à l'apprentissage en
              ligne.
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
  );
}
