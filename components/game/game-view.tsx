"use client"

import { useEffect, useState } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
import { GameHeader } from "./game-header"
import { NumberGrid } from "./number-grid"
import { GameCards } from "./game-cards"
import { useGameStore } from "@/lib/stores/game-store"
import { Button } from "../ui/button"
import { userStore } from "@/lib/stores/user-store"
import { CountdownTimer } from "../common/countdown-timer"
import { Badge } from "../ui/badge"

interface GameViewProps {
  roomId: number
}

export function GameView({ roomId }: GameViewProps) {
  const {game: {gameId, userSelectedCardsIds: selectedCardIds, countdown, endTime}} = useGameStore()
  const currentDrawnNumber = useGameStore(state => state.game.currentDrawnNumber)
  const {leaveGame} = useWebSocketEvents({roomId, enabled: true})
  const userSupabaseId = userStore(state => state.user?.supabaseId)
  CountdownTimer

  const [isLeaving, setLeaving] = useState(false);


  const { connected } = useWebSocketEvents({
    roomId,
    enabled: true,
  })

  const {user} = userStore()
  // const {fetchWallet} = usePaymentStore()
  const { room, fetchRoom } = useRoomStore()


  useEffect(() => {
  const init = async () => {
    try {
      await fetchRoom(roomId)
      // await enterRoom()
      // await Promise.all([
      //   // fetchUserProfile(),
      //   // fetchWallet(),
      // ])
    } catch (err) {
      console.error("Failed to initialize room/payment data:", err)
    }
  }

  init()
}, [])


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
        <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:gap-2">
          <div className="order-1">
            <NumberGrid />
          </div>

          <div className="order-2 sm:order-2">
            <div className="border border-purple rounded-sm h-10 w-full max-w-xs mx-auto bg-yellow-950 p-1">
                <div className="text-center">
                  {!!countdown && <CountdownTimer seconds={countdown} endTime={endTime}/>}
                  {!!!countdown && <Badge variant={"destructive"} className="font-mono text-sm px-3 py-1">Calling: {currentDrawnNumber}</Badge>}
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
