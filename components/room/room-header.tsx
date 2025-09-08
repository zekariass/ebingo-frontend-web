"use client"

import type { Room } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CapacityBadge } from "@/components/lobby/capacity-badge"
import { CountdownTimer } from "@/components/lobby/countdown-timer"
import { useRoomStore } from "@/lib/stores/room-store"
import { ArrowLeft, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { ConnectionStatus } from "./connection-status"

interface RoomHeaderProps {
  room: Room
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const { connected, latencyMs } = useRoomStore()

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
        return "Open for Players"
      case "starting":
        return "Starting Soon"
      case "in-game":
        return "Game in Progress"
      default:
        return "Unknown"
    }
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Lobby</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>

            <div className="space-y-1 min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold truncate">{room.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                <span className="truncate">ID: {room.id}</span>
                <span>${room.fee}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right shrink-0">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${getStatusColor(room.status)} text-white border-0 text-xs`}>
                <span className="hidden sm:inline">{getStatusText(room.status)}</span>
                <span className="sm:hidden">
                  {room.status === "open" ? "Open" : room.status === "starting" ? "Starting" : "In Game"}
                </span>
              </Badge>
              <CapacityBadge current={room.players} max={room.capacity} />
            </div>

            {room.nextStartAt && (
              <CountdownTimer
                targetTime={room.nextStartAt}
                label={<span className="hidden sm:inline">Next game starts in</span>}
              />
            )}

            {/* <div className="flex items-center gap-2 text-xs">
              {connected ? (
                <>
                  <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span className="text-muted-foreground">{latencyMs}ms</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  <span className="text-red-500">
                    <span className="hidden sm:inline">Disconnected</span>
                    <span className="sm:hidden">Offline</span>
                  </span>
                </>
              )}
            </div> */}
            <ConnectionStatus roomId={room.id} />
          </div>
        </div>
      </div>
    </header>
  )
}
