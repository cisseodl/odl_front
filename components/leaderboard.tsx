"use client"

import { useState } from "react"
import { Trophy, Medal, Award, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LeaderboardEntry {
  rank: number
  name: string
  avatar: string
  points: number
  coursesCompleted: number
  hours: number
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: "Sékou Traoré", avatar: "/male-student-avatar.jpg", points: 12500, coursesCompleted: 24, hours: 320 },
  { rank: 2, name: "Aissata Keita", avatar: "/female-developer-portrait.png", points: 11800, coursesCompleted: 22, hours: 295 },
  { rank: 3, name: "Mamadou Diarra", avatar: "/male-student-avatar-2.jpg", points: 11200, coursesCompleted: 21, hours: 280 },
  { rank: 4, name: "Fatoumata Sangaré", avatar: "/female-designer-portrait.png", points: 10800, coursesCompleted: 20, hours: 265 },
  { rank: 5, name: "Boubacar Koné", avatar: "/male-devops-engineer-portrait.jpg", points: 10200, coursesCompleted: 19, hours: 250 },
  { rank: 6, name: "Aminata Coulibaly", avatar: "/female-ai-engineer-portrait.jpg", points: 9800, coursesCompleted: 18, hours: 240 },
  { rank: 7, name: "Moussa Diarra", avatar: "/male-data-scientist-portrait.jpg", points: 9500, coursesCompleted: 17, hours: 230 },
  { rank: 8, name: "Oumou Traoré", avatar: "/female-student-avatar.jpg", points: 9200, coursesCompleted: 16, hours: 220 },
  { rank: 9, name: "Ibrahima Keita", avatar: "/male-student-avatar.jpg", points: 8900, coursesCompleted: 15, hours: 210 },
  { rank: 10, name: "Mariam Sangaré", avatar: "/woman-designer-happy.jpg", points: 8600, coursesCompleted: 14, hours: 200 },
]

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-4 w-4 text-orange-500" />
    case 2:
      return <Medal className="h-4 w-4 text-gray-500" />
    case 3:
      return <Award className="h-4 w-4 text-orange-500" />
    default:
      return null
  }
}

interface LeaderboardProps {
  showCard?: boolean
}

export function Leaderboard({ showCard = true }: LeaderboardProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedData = showAll ? leaderboardData : leaderboardData.slice(0, 5)

  const content = (
    <>
        {/* Top 3 - Design compact et élégant */}
        <div className="space-y-2 mb-3">
          {displayedData.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                entry.rank <= 3
                  ? entry.rank === 1
                    ? "bg-orange-500/10 border border-orange-500/20"
                    : entry.rank === 2
                    ? "bg-gray-100 border border-gray-200"
                    : "bg-orange-500/8 border border-orange-500/15"
                  : "hover:bg-gray-50 border border-transparent"
                }`}
              >
              {/* Rank - Compact */}
              <div className="flex items-center justify-center w-8 shrink-0">
                  {entry.rank <= 3 ? (
                    getRankIcon(entry.rank)
                  ) : (
                  <span className="text-xs font-bold text-gray-500">#{entry.rank}</span>
                  )}
                </div>

              {/* Avatar - Plus petit */}
              <Avatar className="h-8 w-8 border border-gray-200">
                  <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.name} />
                <AvatarFallback className="text-xs">{entry.name[0]}</AvatarFallback>
                </Avatar>

              {/* Info - Compact */}
                <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-black truncate">{entry.name}</p>
                    {entry.rank <= 3 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        Top {entry.rank}
                      </Badge>
                    )}
                  </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600 mt-0.5">
                    <span>{entry.coursesCompleted} cours</span>
                    <span>•</span>
                    <span>{entry.hours}h</span>
                  </div>
                </div>

              {/* Points - Compact */}
              <div className="text-right shrink-0">
                <p className="font-bold text-sm text-black tabular-nums">
                  {entry.points.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500">pts</p>
                </div>
              </div>
          ))}
        </div>

        {/* Bouton Voir plus/moins */}
        {leaderboardData.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full text-xs text-gray-600 hover:text-black h-8"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Voir les {leaderboardData.length - 5} autres
              </>
            )}
          </Button>
        )}

        {/* Footer compact */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-[11px] text-gray-500 text-center">
            Mis à jour chaque lundi à 00h00
          </p>
        </div>
    </>
  )

  if (showCard) {
    return (
      <Card className="border-2 hover:border-primary/20 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Leaderboard Hebdomadaire</CardTitle>
              <CardDescription>Classement des meilleurs étudiants</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {content}
      </CardContent>
    </Card>
  )
  }

  return <div>{content}</div>
}

