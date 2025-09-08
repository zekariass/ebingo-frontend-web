"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Wifi, WifiOff } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Room } from "@/lib/types"

interface GameHeaderProps {
  room: Room
  connected: boolean
}

export function GameHeader({ room, connected }: GameHeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-card border-b px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-sm sm:text-base">{room.name}</h1>
            <p className="text-xs text-muted-foreground">
              ${room.fee} • {room.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connected ? (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs hidden sm:inline">Disconnected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
