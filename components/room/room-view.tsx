"use client"

import { useEffect } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { RoomHeader } from "./room-header"
import { CardSelectionGrid } from "./card-selection-grid"
import { SelectedCardsPanel } from "./selected-cards-panel"
import { NumberCallingArea } from "./number-calling-area"
import { GameControls } from "./game-controls"
// import { generateBingoCard } from "@/lib/utils/bingo"
import { useGameStore } from "@/lib/stores/game-store"
import { WinnerDialog } from "./winner/winner-dialog"
import { GameStatus } from "@/lib/types"
import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"
import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"

interface RoomViewProps {
  roomId: number
}

export function RoomView({ roomId }: RoomViewProps) {
  const { room, fetchRoom, resetRoom, getRoomFromLobby, setRoom, initializeRoom } = useRoomStore()
  const {game: {userSelectedCardsIds, countdown, status}} = useGameStore()
  const winner = useGameStore(state => state.winner)
  const resetGame = useGameStore(state => state.resetGameState)
  const resetWinner = useGameStore(state => state.resetWinner)
  const {enterRoom} = useWebSocketEvents({roomId, enabled: true})

  const disableCardSelection = (countdown < 10 && countdown !== -1) || (status === GameStatus.PLAYING)

  const onGameWinnerClose = () => {
    // resetGame()
    resetWinner()
    // enterRoom();
  }

  useEffect(()=>{
    enterRoom()
  }, [])

  // const { connected, enterRoom } = useWebSocketEvents({ roomId })

  // const {t, i18n} = useTranslation("common")
  // console.log("=============================>>>> RoomView Rendered with selected cards:", userSelectedCardsIds)

  useEffect(() => {
    resetRoom()
    fetchRoom(roomId)
    // getRoomFromLobby(roomId)
  }, [roomId, fetchRoom])


  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading room...</div>
      </div>
    )
  }

  // const isPracticeRoom = roomId === "test-room-1"

  return (
    <div className="min-h-screen bg-background">
      <RoomHeader room={room} />
      {winner.playerName && <WinnerDialog showResult={!!winner.playerName} winner={winner} onClose={onGameWinnerClose} />}

      <main className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Left Column - Card Selection */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-6">
            <CardSelectionGrid roomId={roomId} capacity={room.capacity} disabled={disableCardSelection}/>

            {userSelectedCardsIds.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <SelectedCardsPanel />
                <GameControls disabled={disableCardSelection}/>
              </div>
            )}
          </div>

          {/* Right Column - Game Info */}
          <div className="space-y-3 sm:space-y-6">
            <NumberCallingArea />
          </div>
        </div>
      </main>
    </div>
  )
}
