"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Star, Play, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { mockCourses } from "@/lib/data"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AnimatedStats } from "@/components/animated-stats"
import { FadeInView } from "@/components/fade-in-view"
import type { UseEmblaCarouselType } from "embla-carousel-react"

type CarouselApi = UseEmblaCarouselType[1]

export default function HomePage() {
  const [api, setApi] = useState<CarouselApi | null>(null)
  const [current, setCurrent] = useState(0)

  // Organize courses by category
  // Organize courses by category
  const cloudDataCourses = mockCourses.filter((c) => c.category === "Cloud Computing" || c.category === "Data Science" || c.category === "Intelligence Artificielle").slice(0, 6)
  const developmentCourses = mockCourses.filter((c) => c.category.includes("Développement")).slice(0, 6)
  const designCourses = mockCourses.filter((c) => c.category.includes("Design")).slice(0, 6)
  const otherCourses = mockCourses.filter((c) => c.category === "Business" || c.category === "DevOps").slice(0, 6)
  const trendingCourses = mockCourses.filter((c) => c.bestseller).slice(0, 6)
  const suggestedCourses = [...mockCourses].slice(0, 6)

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const testimonials = [
    {
      name: "Kadiatou Traoré",
      role: "Développeuse Front-End",
      content: "J'ai transformé ma carrière grâce aux cours d'Orange Digital Learning. Les instructeurs sont exceptionnels !",
      avatar: "/woman-developer-smiling.jpg",
    },
    {
      name: "Ousmane Keita",
      role: "Data Scientist",
      content: "La qualité des cours et l'accompagnement font vraiment la différence. Je recommande à 100%.",
      avatar: "/man-data-scientist-portrait.jpg",
    },
    {
      name: "Mariam Sangaré",
      role: "UX Designer",
      content: "J'ai pu monter en compétences et décrocher mon emploi de rêve. Merci Orange Digital Learning !",
      avatar: "/woman-designer-happy.jpg",
    },
  ]

  // Hero slides data
  const heroSlides = [
    {
      id: 1,
      title: "Devenez Expert Cloud & Data",
      description: "Maîtrisez AWS, Azure et la Data Science avec nos nouveaux parcours certifiants.",
      image: "/7.jpeg", // Updated to new Cloud background
      buttonText: "Explorer Cloud & Data",
      link: "/courses?category=Cloud+Computing",
    },
    {
      id: 2,
      title: "L'Intelligence Artificielle à portée de main",
      description: "Formez-vous aux dernières avancées en IA générative et Machine Learning.",
      image: "/3.jpeg", // Updated to new AI background
      buttonText: "Découvrir l'IA",
      link: "/courses?category=Intelligence+Artificielle",
    },
    {
      id: 3,
      title: "Développez vos compétences Tech",
      description: "Des milliers de cours en Développement Web, Mobile et DevOps vous attendent.",
      image: "/desola-lanre-ologun-kwzWjTnDPLk-unsplash.jpg",
      buttonText: "Voir tout le catalogue",
      link: "/courses",
    },
  ]

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section - Style Orange Mali Impactant */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-muted/30">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 6000,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {heroSlides.map((slide) => (
              <CarouselItem key={slide.id} className="pl-0">
                <div className="relative w-full min-h-[600px] md:min-h-[650px] lg:min-h-[700px] overflow-hidden">
                  {/* Background Image avec overlay Orange Mali */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority={slide.id === 1}
                      quality={90}
                    />
                    {/* Overlay avec accent orange */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                  </div>

                  {/* Content - Style Orange Mali */}
                  <div className="relative z-10 h-full flex items-center text-white py-20 md:py-24">
                    <div className="container mx-auto px-4 lg:px-8">
                      <div className="max-w-4xl mx-auto text-center space-y-8">
                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg">
                          {slide.title}
                        </h1>

                        {/* Description */}
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                          {slide.description}
                        </p>

                        {/* CTA Button - Orange Impact Maximum */}
                        <div className="flex justify-center gap-4 pt-4">
                          <Button
                            size="lg"
                            className="bg-primary text-white hover:bg-primary/95 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-md group/btn"
                            asChild
                          >
                            <Link href={slide.link}>
                              {slide.buttonText}
                              <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-black/20 hover:bg-black/40 border-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110" />
          <CarouselNext className="right-4 bg-black/20 hover:bg-black/40 border-white/20 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110" />
        </Carousel>

        {/* Slide Indicators - Style Orange Mali */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 hover:scale-125 ${index === current
                ? "bg-primary w-8 shadow-lg"
                : "bg-white/40 hover:bg-white/60 w-2"
                }`}
              aria-label={`Aller au slide ${index + 1}`}
              aria-current={index === current ? "true" : "false"}
            />
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 lg:py-16 bg-white border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInView delay={0.1}>
            <AnimatedStats
              stats={[
                { value: 250000, label: "Étudiants actifs", useFormat: true },
                { value: 5000, label: "Cours disponibles", useFormat: true },
                { value: 1200, label: "Instructeurs experts", useFormat: true },
                { value: 98, label: "Taux de satisfaction", suffix: "%" },
              ]}
            />
          </FadeInView>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-8 lg:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 tracking-tight">Bienvenue, continuez d'apprendre !</h2>

          {/* Keep on Learning - Courses in Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {mockCourses.slice(0, 2).map((course) => (
              <Card key={course.id} className="border border-border hover:shadow-xl hover:border-primary transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <Link href={`/learn/${course.id}`} className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-black/5 group/thumb">
                      <Image
                        src={course.imageUrl || "/placeholder.svg"}
                        alt={course.title}
                        fill
                        className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover/thumb:bg-primary/40 transition-colors">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">{course.category}</p>
                      <Link href={`/learn/${course.id}`}>
                        <h3 className="font-bold text-sm line-clamp-2 mb-3 hover:text-primary transition-colors leading-snug text-black">{course.title}</h3>
                      </Link>
                      <div className="space-y-1.5">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-2 rounded-full transition-all duration-500 shadow-sm" style={{ width: "45%" }} />
                        </div>
                        <p className="text-xs text-muted-foreground font-semibold">45% complété</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What to Learn Next / Suggested for You */}
      <CourseSection
        title="Que souhaitez-vous apprendre ensuite"
        subtitle="Suggéré pour vous"
        courses={suggestedCourses}
      />

      {/* Trending */}
      <CourseSection
        title="Tendances"
        courses={trendingCourses}
        bgGray
      />

      {/* How Learners Achieve Goals - Style Orange Mali */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-12 text-center tracking-tight">
            Comment les apprenants comme vous atteignent leurs objectifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-border hover:shadow-xl hover:border-primary transition-all duration-300 bg-white">
                <CardContent className="p-6 lg:p-8 space-y-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/30 shadow-sm">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary text-white font-bold">{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm text-black">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-black leading-relaxed">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-black">Apprenez des compétences recherchées</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Avec plus de 200 000 contenus vidéo</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-black">Choisissez des cours enseignés par des experts</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Des instructeurs du monde réel</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-black">Apprenez à votre rythme</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Avec un accès à vie sur mobile et desktop</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured: Cloud & Data */}
      <CourseSection
        title="À la une : Cloud, Data & IA"
        subtitle="Les compétences les plus recherchées du moment"
        courses={cloudDataCourses}
        bgGray
      />

      {/* Top Courses in Development */}
      <CourseSection
        title="Développement Web & Mobile"
        courses={developmentCourses}
      />

      {/* Top Courses in Business & DevOps */}
      <CourseSection
        title="Business & DevOps"
        courses={otherCourses}
        bgGray
      />

      {/* Top Courses in Design */}
      <CourseSection
        title="Design Créatif"
        courses={designCourses}
      />
    </div>
  )
}

// Reusable Course Section Component
function CourseSection({
  title,
  subtitle,
  courses,
  bgGray = false,
}: {
  title: string
  subtitle?: string
  courses: typeof mockCourses
  bgGray?: boolean
}) {
  return (
    <section className={`py-12 lg:py-16 ${bgGray ? "bg-muted/30" : "bg-white"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-3 font-medium">{subtitle}</p>}
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {courses.map((course) => (
              <CarouselItem key={course.id} className="pl-2 md:pl-4 basis-auto md:basis-1/4 lg:basis-1/5">
                <Link href={`/courses/${course.id}`} className="block h-full group">
                  <Card className="border border-border hover:shadow-xl hover:border-primary transition-all duration-300 hover:-translate-y-1 h-full bg-white">
                    <div className="relative aspect-video overflow-hidden bg-black/5">
                      <Image
                        src={course.imageUrl || "/placeholder.svg"}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-4 space-y-2.5">
                      <h3 className="font-bold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors text-black">{course.title}</h3>
                      <p className="text-xs text-muted-foreground font-semibold">{course.instructor.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-black">{course.rating.toFixed(1)}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i < Math.floor(course.rating)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/30"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({course.reviewCount.toLocaleString()})</span>
                      </div>
                      {course.bestseller && (
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-primary text-white rounded border-0 shadow-sm">
                          Nouveau
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
