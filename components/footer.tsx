"use client"

import { useState } from "react"
import Link from "next/link"
import { GraduationCap, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("")

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail) {
      toast.success("Inscription réussie !", {
        description: "Vous recevrez nos dernières actualités par email.",
      })
      setNewsletterEmail("")
    } else {
      toast.error("Email requis", {
        description: "Veuillez entrer votre adresse email.",
      })
    }
  }
  const footerLinks = {
    "À Propos": [
      { label: "Notre Mission", href: "/about" },
      { label: "Carrières", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Presse", href: "/press" },
    ],
    Ressources: [
      { label: "Centre d'Aide", href: "/help" },
      { label: "Devenir Instructeur", href: "/teach" },
      { label: "Témoignages", href: "/testimonials" },
      { label: "Partenaires", href: "/partners" },
    ],
    Légal: [
      { label: "Conditions d'Utilisation", href: "/terms" },
      { label: "Politique de Confidentialité", href: "/privacy" },
      { label: "Politique de Cookies", href: "/cookies" },
      { label: "Accessibilité", href: "/accessibility" },
    ],
  }

  return (
    <footer 
      role="contentinfo"
      aria-label="Pied de page"
      className="bg-black border-t border-white/10 mt-20"
    >
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Description - Style Orange Mali - Fond Noir */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="rounded-lg bg-primary p-2.5 group-hover:bg-primary/95 transition-all duration-200 shadow-lg group-hover:shadow-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Orange Digital Learning</span>
            </Link>
            <p className="text-sm text-white/70 mb-8 leading-relaxed max-w-md">
              Plateforme de formation en ligne qui vous aide à acquérir de nouvelles compétences et à atteindre vos
              objectifs professionnels.
            </p>

            {/* Newsletter - Style Orange Mali */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-white">Newsletter</h4>
              <p className="text-xs text-white/60">
                Recevez nos dernières actualités et offres spéciales
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Votre email"
                  className="h-10 bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-primary focus:ring-primary/30 rounded-md"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <Button type="submit" size="sm" className="h-10 px-5 bg-primary text-white hover:bg-primary/95 font-semibold rounded-md shadow-lg">
                  S'abonner
                </Button>
              </form>
            </div>
          </div>

          {/* Links Columns - Style Orange Mali - Fond Noir */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-sm text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-primary transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar - Style Orange Mali - Fond Noir */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-white/60 font-medium">© {new Date().getFullYear()} Orange Digital Learning. Tous droits réservés.</p>

          {/* Social Media */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-primary hover:bg-white/10 rounded-md">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-primary hover:bg-white/10 rounded-md">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-primary hover:bg-white/10 rounded-md">
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-primary hover:bg-white/10 rounded-md">
              <Instagram className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
