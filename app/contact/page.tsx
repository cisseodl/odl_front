"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"
import { FadeInView } from "@/components/fade-in-view"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Contact form submitted:", formData)
    toast.success("Message envoyé !", {
      description: "Notre équipe vous répondra dans les 24 heures.",
    })
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-muted-foreground">Notre équipe est là pour répondre à toutes vos questions</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <FadeInView delay={0.1}>
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground">support@orangedigitallearning.com</p>
              </CardContent>
            </Card>
          </FadeInView>

          <FadeInView delay={0.2}>
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Téléphone</h3>
                <p className="text-sm text-muted-foreground">+33 1 23 45 67 89</p>
              </CardContent>
            </Card>
          </FadeInView>

          <FadeInView delay={0.3}>
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02]">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-4 text-primary" />
                <h3 className="font-bold mb-2">Adresse</h3>
                <p className="text-sm text-muted-foreground">123 Rue de l'Éducation, Paris</p>
              </CardContent>
            </Card>
          </FadeInView>
        </div>

        <FadeInView delay={0.4}>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Envoyez-nous un message
              </CardTitle>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    placeholder="Jean Dupont"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jean@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  placeholder="Comment pouvons-nous vous aider ?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Décrivez votre question ou problème en détail..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Envoyer le message
              </Button>
            </form>
          </CardContent>
        </Card>
        </FadeInView>
      </div>
    </div>
  )
}
