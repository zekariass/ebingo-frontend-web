"use client"

import type { Room } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CapacityBadge } from "./capacity-badge"
import { CountdownTimer } from "./countdown-timer"
import { Users, DollarSign, Clock } from "lucide-react"
import Link from "next/link"

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  const occupancyPercentage = (room.players / room.capacity) * 100
  const isNearlyFull = occupancyPercentage >= 80
  const isFull = room.players >= room.capacity

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "open":
        return "bg-green-500"
      case "starting":
        return "bg-yellow-500"
      case "in-game":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: Room["status"]) => {
    switch (status) {
      case "open":
        return "Open"
      case "starting":
        return "Starting Soon"
      case "in-game":
        return "In Progress"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight">{room.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">${room.fee} entry</span>
            </div>
          </div>

          <Badge variant="secondary" className={`${getStatusColor(room.status)} text-white border-0`}>
            {getStatusText(room.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Players</span>
            </div>
            <CapacityBadge current={room.players} max={room.capacity} variant={isNearlyFull ? "warning" : "default"} />
          </div>

          <Progress value={occupancyPercentage} className="h-2" />
        </div>

        {room.nextStartAt && room.status !== "in-game" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Next game starts in</span>
            </div>
            <CountdownTimer targetTime={room.nextStartAt} />
          </div>
        )}

        {room.status === "in-game" && (
          <div className="text-center py-2">
            <CountdownTimer
              targetTime={new Date(Date.now() + 180000).toISOString()} // Mock 3 min countdown
              label="Next game opens in"
            />
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className="w-full"
          disabled={isFull && room.status === "open"}
          variant={room.status === "open" ? "default" : "secondary"}
        >
          <Link href={`/rooms/${room.id}`}>
            {room.status === "open"
              ? isFull
                ? "Room Full"
                : "Join Room"
              : room.status === "starting"
                ? "Join Now"
                : "View Game"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
