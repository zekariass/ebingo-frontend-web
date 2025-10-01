"use client"

import { useEffect, useState } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
// import { useGameSimulation } from "@/lib/hooks/use-game-simulation"
import { GameHeader } from "./game-header"
import { NumberGrid } from "./number-grid"
import { GameCards } from "./game-cards"
import { useGameStore } from "@/lib/stores/game-store"
import { Button } from "../ui/button"
import { userStore } from "@/lib/stores/user-store"
import { CountdownTimer } from "../common/countdown-timer"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog"
import { DialogHeader } from "../ui/dialog"

interface GameViewProps {
  roomId: number
}

export function GameView({ roomId }: GameViewProps) {
  const { room, setRoom } = useRoomStore()
  const {game: {gameId, userSelectedCardsIds: selectedCardIds, countdown}} = useGameStore()
  const currentDrawnNumber = useGameStore(state => state.game.currentDrawnNumber)
  const {leaveGame} = useWebSocketEvents({roomId, enabled: true})
  const userSupabaseId = userStore(state => state.user?.supabaseId)
  CountdownTimer

  const [isLeaving, setLeaving] = useState(false);


  const { connected } = useWebSocketEvents({
    roomId,
    enabled: true,
  })

  // const { isSimulating } = useGameSimulation({
  //   enabled: roomId === "test-room-1",
  //   roomId,
  //   numberCallInterval: 3000, // Call number every 3 seconds
  //   autoStart: true,
  // })

  // useEffect(() => {
  //   if (!room) {
  //     if (roomId === "test-room-1") {
  //       setRoom({
  //         id: roomId,
  //         name: "$10 Test Room (Auto-Play)",
  //         fee: 10,
  //         players: 15,
  //         capacity: 100,
  //         status: "in-game",
  //       })
  //     }
  //   }
  // }, [room, roomId, setRoom])


  const handleLeaveGame = () => {
    setLeaving(true)
    leaveGame(gameId, userSupabaseId? userSupabaseId: "")
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading game...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <GameHeader room={room} connected={connected} />

      <div className="container mx-auto p-2 sm:p-4">
        {/* {isSimulating && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              🎮 Test Mode: Numbers are being called automatically every 3 seconds
            </p>
          </div>
        )} */}

        <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-2">
          <div className="order-1">
            <NumberGrid />
          </div>

          <div className="order-2 sm:order-2">
            <div className="border border-purple rounded-sm h-10 w-full max-w-xs mx-auto bg-yellow-950 p-1">
                <div className="text-center">
                  {!!countdown && <CountdownTimer seconds={countdown}/>}
                  {!!!countdown && <h3 className="font-mono text-sm">Calling: {currentDrawnNumber}</h3>}
                </div>
            </div>
            <GameCards selectedCardIds={selectedCardIds} />
          </div>
        </div>
          <div className="py-2 flex items-center justify-center">
            <Button className="w-full sm:w-1/2 bg-amber-800 text-white p-4 text-white text-xl hover:bg-amber-600 cursor-pointer"
              onClick={()=>handleLeaveGame()}>
              {!isLeaving ? `Leave Game` : "Leaving..."}
            </Button>
          </div>
      </div>
    </div>
  )
}
