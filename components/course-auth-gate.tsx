"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"

interface CourseAuthGateProps {
  courseId: string | number
}

/**
 * Affiché quand un visiteur non connecté clique sur un cours.
 * "Avez-vous déjà un compte ODL ?" → Connexion ou Inscription, puis redirection vers le cours.
 */
export function CourseAuthGate({ courseId }: CourseAuthGateProps) {
  const redirectUrl = `/courses/${courseId}`
  const loginUrl = `/auth?redirect=${encodeURIComponent(redirectUrl)}&mode=login`
  const signupUrl = `/auth?redirect=${encodeURIComponent(redirectUrl)}&mode=signup`

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl">Voir ce cours</CardTitle>
          <CardDescription>
            Avez-vous déjà un compte ODL ?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Connectez-vous pour accéder à la fiche du cours, ou créez un compte sur la plateforme ODL pour découvrir nos formations.
          </p>
          <div className="grid gap-3 pt-2">
            <Button asChild className="w-full" size="lg">
              <Link href={loginUrl}>
                <LogIn className="mr-2 h-4 w-4" />
                J&apos;ai déjà un compte – Se connecter
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href={signupUrl}>
                <UserPlus className="mr-2 h-4 w-4" />
                Créer un compte ODL
              </Link>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Après connexion ou inscription, vous pourrez voir le cours et vous y inscrire pour accéder aux leçons, quiz et labs.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
