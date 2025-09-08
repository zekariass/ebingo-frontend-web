"use client"

import { useEffect } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { useWebSocketEvents } from "@/lib/hooks/use-websocket-events"
import { RoomHeader } from "./room-header"
import { ConnectionStatus } from "./connection-status"
import { CardSelectionGrid } from "./card-selection-grid"
import { SelectedCardsPanel } from "./selected-cards-panel"
import { NumberCallingArea } from "./number-calling-area"
import { GameControls } from "./game-controls"
import { WinnerBanner } from "./winner-banner"
import { generateBingoCard } from "@/lib/utils/bingo"

interface RoomViewProps {
  roomId: string
}

export function RoomView({ roomId }: RoomViewProps) {
  const { room, game, selectedCardIds, userCards, setRoom, setUserCards, initializeRoom } = useRoomStore()

  const { connected, requestSnapshot, joinRoom } = useWebSocketEvents({ roomId })

  useEffect(() => {
    initializeRoom(roomId)

    // Mock room data - TODO: Replace with actual API call
    const mockRoom = {
      id: roomId,
      name: `$${roomId.includes("10") ? "10" : roomId.includes("20") ? "20" : roomId.includes("50") ? "50" : "100"} Bingo Room`,
      fee: Number.parseInt(
        roomId.includes("10") ? "10" : roomId.includes("20") ? "20" : roomId.includes("50") ? "50" : "100",
      ),
      players: Math.floor(Math.random() * 80) + 10,
      capacity: 100,
      status: "open" as const,
      nextStartAt: new Date(Date.now() + 120000).toISOString(),
    }

    if (roomId === "test-room-1") {
      mockRoom.name = "Free Practice Room"
      mockRoom.fee = 0
    }

    setRoom(mockRoom)
  }, [roomId, initializeRoom, setRoom])

  useEffect(() => {
    // Generate user cards when cards are selected but userCards is empty
    if (selectedCardIds.length > 0 && userCards.length !== selectedCardIds.length) {
      const cards = selectedCardIds.map((id) => generateBingoCard(id))
      setUserCards(cards)
    }
  }, [selectedCardIds, userCards.length, setUserCards])

  useEffect(() => {
    if (connected && room) {
      requestSnapshot()
    }
  }, [connected, room, requestSnapshot])

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading room...</div>
      </div>
    )
  }

  const isPracticeRoom = roomId === "test-room-1"

  return (
    <div className="min-h-screen bg-background">
      <RoomHeader room={room} />

      {/* <div className="container mx-auto px-2 sm:px-4 pt-2 sm:pt-4">
        <ConnectionStatus roomId={roomId} />

        {isPracticeRoom && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-300 text-sm font-medium">
              🎓 Practice Room: Learn the game mechanics without any cost. No prizes awarded.
            </p>
          </div>
        )}
      </div> */}

      <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Left Column - Card Selection */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-6">
            <CardSelectionGrid roomId={roomId} capacity={room.capacity} />

            {selectedCardIds.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <SelectedCardsPanel />
                <GameControls />
              </div>
            )}
          </div>

          {/* Right Column - Game Info */}
          <div className="space-y-3 sm:space-y-6">
            <NumberCallingArea />
          </div>
        </div>
      </main>

      {game?.winners && game.winners.length > 0 && <WinnerBanner winners={game.winners} />}
    </div>
  )
}
