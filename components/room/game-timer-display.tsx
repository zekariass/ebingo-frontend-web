"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useGameTimer } from "@/lib/hooks/use-game-timer"
import { Clock, Play, Trophy, Hourglass } from "lucide-react"
import { cn } from "@/lib/utils"

export function GameTimerDisplay() {
  const { timeRemaining, isActive, phase, progress, formatTime } = useGameTimer()

  const getPhaseConfig = (phase: string) => {
    switch (phase) {
      case "waiting":
        return {
          icon: Clock,
          label: "Next Game",
          color: "text-muted-foreground",
          bgColor: "bg-muted",
        }
      case "starting":
        return {
          icon: Hourglass,
          label: "Starting Soon",
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-100 dark:bg-yellow-900",
        }
      case "active":
        return {
          icon: Play,
          label: "Game Active",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900",
        }
      case "finished":
        return {
          icon: Trophy,
          label: "Game Finished",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900",
        }
      default:
        return {
          icon: Clock,
          label: "Unknown",
          color: "text-muted-foreground",
          bgColor: "bg-muted",
        }
    }
  }

  const config = getPhaseConfig(phase)
  const Icon = config.icon

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", config.color)} />
              <span className="text-sm font-medium">{config.label}</span>
            </div>
            <Badge variant="secondary" className={cn("text-xs", config.bgColor, config.color)}>
              {phase.toUpperCase()}
            </Badge>
          </div>

          {isActive && timeRemaining > 0 && (
            <>
              <div className="text-center">
                <div className={cn("text-3xl font-bold font-mono", config.color)}>{formatTime()}</div>
              </div>

              {phase === "starting" && <Progress value={progress * 100} className="h-2" />}
            </>
          )}

          {phase === "active" && (
            <div className="text-center">
              <div className={cn("text-lg font-semibold", config.color)}>Game in Progress</div>
              <div className="text-sm text-muted-foreground">Mark numbers as they are called</div>
            </div>
          )}

          {phase === "finished" && (
            <div className="text-center">
              <div className={cn("text-lg font-semibold", config.color)}>Waiting for Next Game</div>
            </div>
          )}

          {!isActive && phase === "waiting" && (
            <div className="text-center text-muted-foreground">
              <div className="text-sm">Waiting for players to join</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
