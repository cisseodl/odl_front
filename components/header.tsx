"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, BookOpen, LayoutDashboard, GraduationCap, User, UserCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/store/auth-store"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  return (
    <>
      {/* Main Navbar - Design Orange Mali Moderne - Fond Blanc */}
      <header
        id="main-navigation"
        role="banner"
        className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 backdrop-blur-sm"
        aria-label="Navigation principale"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 md:h-18 items-center justify-between gap-4">
            {/* Left Section: Logo + Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo - Texte uniquement */}
              <Link
                href="/"
                className="flex items-center transition-opacity duration-200 hover:opacity-90"
                aria-label="Orange Digital Learning - Accueil"
              >
                <Image src="/logo.png" alt="Orange Digital Learning" width={120} height={40} className="h-10 w-auto" priority />
              </Link>

              {/* Navigation Links - Desktop - Style Orange Mali - Conforme agent.md */}
              <nav
                role="navigation"
                aria-label="Navigation principale"
                className="hidden lg:flex items-center gap-1"
              >
                <Link
                  href="/courses"
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative group ${pathname === "/courses" || pathname.startsWith("/courses/")
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Cours
                  </span>
                  {(pathname === "/courses" || pathname.startsWith("/courses/")) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </Link>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative group ${pathname === "/dashboard" || pathname.startsWith("/dashboard")
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </span>
                  {(pathname === "/dashboard" || pathname.startsWith("/dashboard")) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </Link>
                <Link
                  href="/learning"
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative group ${pathname === "/learning" || pathname.startsWith("/learn")
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Mon Apprentissage
                  </span>
                  {(pathname === "/learning" || pathname.startsWith("/learn")) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </Link>
                <Link
                  href="/about"
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative group ${pathname === "/about"
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    À propos
                  </span>
                  {pathname === "/about" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </Link>
              </nav>
            </div>

            {/* Center: Search Bar - Design Orange Mali */}
            <div className="hidden md:flex flex-1 max-w-lg mx-6" role="search" aria-label="Recherche de cours">
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Rechercher des cours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-gray-100 border border-gray-200 text-foreground placeholder:text-muted-foreground focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all duration-200 text-sm rounded-md"
                  aria-label="Rechercher des cours"
                  aria-describedby="search-description"
                />
                <span id="search-description" className="sr-only">
                  Recherchez parmi tous les cours disponibles
                </span>
              </div>
            </div>

            {/* Right Section: Actions - Conforme agent.md (sans panier/vente) */}
            <div className="flex items-center gap-2.5">
              {/* Search Icon Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground hover:text-primary hover:bg-gray-100 h-9 w-9"
                aria-label="Rechercher"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* CTA Button - Orange Impact Maximum Style Orange Mali */}
              <Button
                className="hidden sm:flex bg-primary text-white hover:bg-primary/95 font-semibold px-5 py-2 h-9 text-sm shadow-lg hover:shadow-xl transition-all duration-200 rounded-md"
                asChild
              >
                <Link href="/courses">
                  Explorer les cours
                </Link>
              </Button>

              {/* User Profile */}
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary hover:bg-gray-100 h-9 w-9 ml-2"
                aria-label="Profil"
                asChild
              >
                <Link href={isAuthenticated ? "/profile" : "/auth"}>
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </Link>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-foreground hover:text-primary hover:bg-gray-100 h-9 w-9"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Menu mobile"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation - Style Orange Mali - Fond Blanc - Conforme agent.md (sans panier/vente) */}
          {mobileMenuOpen && (
            <nav
              role="navigation"
              aria-label="Menu mobile"
              className="lg:hidden py-4 border-t border-gray-200 bg-white"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href="/courses"
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${pathname === "/courses" || pathname.startsWith("/courses/")
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-gray-100"
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="h-4 w-4" />
                  Cours
                </Link>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${pathname === "/dashboard" || pathname.startsWith("/dashboard")
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-gray-100"
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/learning"
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${pathname === "/learning" || pathname.startsWith("/learn")
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-gray-100"
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <GraduationCap className="h-4 w-4" />
                  Mon Apprentissage
                </Link>
                <Link
                  href="/about"
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${pathname === "/about"
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-gray-100"
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="h-4 w-4" />
                  À propos
                </Link>
                <Link
                  href="/profile"
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${pathname === "/profile" || pathname.startsWith("/profile")
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-gray-100"
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle className="h-4 w-4" />
                  Mon Profil
                </Link>
                <div className="px-4 pt-2 mt-2 border-t border-gray-200">
                  <Button
                    className="w-full bg-primary text-white hover:bg-primary/95 font-semibold rounded-md"
                    asChild
                  >
                    <Link href="/courses" onClick={() => setMobileMenuOpen(false)}>
                      Explorer les cours
                    </Link>
                  </Button>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
