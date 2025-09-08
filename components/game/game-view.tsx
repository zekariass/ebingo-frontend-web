"use client"

import { useEffect } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { useWebSocketEvents } from "@/lib/hooks/use-websocket-events"
import { useGameSimulation } from "@/lib/hooks/use-game-simulation"
import { GameHeader } from "./game-header"
import { NumberGrid } from "./number-grid"
import { GameCards } from "./game-cards"

interface GameViewProps {
  roomId: string
}

export function GameView({ roomId }: GameViewProps) {
  const { room, selectedCardIds, setRoom } = useRoomStore()

  const { connected } = useWebSocketEvents({
    roomId,
    enabled: true,
  })

  const { isSimulating } = useGameSimulation({
    enabled: roomId === "test-room-1",
    roomId,
    numberCallInterval: 3000, // Call number every 3 seconds
    autoStart: true,
  })

  useEffect(() => {
    if (!room) {
      if (roomId === "test-room-1") {
        setRoom({
          id: roomId,
          name: "$10 Test Room (Auto-Play)",
          fee: 10,
          players: 15,
          capacity: 100,
          status: "in-game",
        })
      }
    }
  }, [room, roomId, setRoom])

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <GameHeader room={room} connected={connected || isSimulating} />

      <div className="container mx-auto p-2 sm:p-4">
        {isSimulating && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              🎮 Test Mode: Numbers are being called automatically every 3 seconds
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <div className="order-1">
            <NumberGrid />
          </div>

          <div className="order-2 sm:order-2">
            <GameCards selectedCardIds={selectedCardIds} />
          </div>
        </div>
      </div>
    </div>
  )
}
