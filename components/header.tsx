"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  Search,
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  User,
  UserCircle
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/store/auth-store"
import { useLanguage } from "@/lib/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeSelector } from "@/components/theme-selector"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)

  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()
  const { t } = useLanguage()
  const { theme } = useTheme()

  const isHomePage = pathname === "/"
  const isDarkMode = theme === "dark"

  // Texte blanc quand on est sur la home et non scrollé, ou en mode sombre
  const shouldUseWhiteText = (isHomePage && !isScrolled) || isDarkMode

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      id="main-navigation"
      role="banner"
      aria-label="Navigation principale"
      className={cn(
        "fixed top-0 left-0 z-50 w-full transition-all duration-300 ease-in-out",
        isScrolled
          ? isDarkMode
            ? "bg-gray-800/95 backdrop-blur-md shadow-md border-b border-gray-600/50"
            : "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200/50"
          : "bg-transparent shadow-none border-transparent"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* LEFT */}
          <div className="flex items-center gap-8">
            <Link href="/" aria-label="Accueil">
              <Image
                src="/logo.png"
                alt="Orange Digital Learning"
                width={120}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { href: "/courses", icon: BookOpen, label: t("common.courses") },
                { href: "/dashboard", icon: LayoutDashboard, label: t("common.dashboard") },
                { href: "/learning", icon: GraduationCap, label: t("common.myLearning") },
                { href: "/about", icon: BookOpen, label: t("common.about") }
              ].map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium flex items-center gap-2 transition",
                      active
                        ? "text-primary font-semibold"
                        : shouldUseWhiteText
                        ? "text-white hover:text-white/80"
                        : "text-black hover:text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* SEARCH */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${shouldUseWhiteText ? "text-white/80" : "text-black/70"}`} />
              <Input
                type="search"
                placeholder={t("common.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10 h-10 rounded-md transition",
                  isScrolled
                    ? isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200"
                    : "bg-white/10 border-white/20 text-white placeholder:text-white/70"
                )}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <ThemeSelector className={shouldUseWhiteText ? "text-white" : "text-black"} />
            <LanguageSelector className={shouldUseWhiteText ? "text-white" : "text-black"} />

            <Button
              className="hidden sm:flex bg-primary text-white px-5 h-9"
              asChild
            >
              <Link href="/courses">{t("common.exploreCourses")}</Link>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link href={isAuthenticated ? "/profile" : "/auth"}>
                <User className={`h-5 w-5 ${shouldUseWhiteText ? "text-white" : "text-black"}`} />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 bg-white border-t">
            <div className="flex flex-col gap-1">
              {[
                { href: "/courses", icon: BookOpen, label: t("common.courses") },
                { href: "/dashboard", icon: LayoutDashboard, label: t("common.dashboard") },
                { href: "/learning", icon: GraduationCap, label: t("common.myLearning") },
                { href: "/about", icon: BookOpen, label: t("common.about") }
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
