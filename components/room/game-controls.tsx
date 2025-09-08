"use client"

import { useRoomStore } from "@/lib/stores/room-store"
import { Card, CardContent } from "@/components/ui/card"
import { StartGameButton } from "./start-game-button"
import { BingoClaimButton } from "./bingo-claim-button"
import { checkWinningPattern } from "@/lib/utils/bingo"

export function GameControls() {
  const { room, game, selectedCardIds, userCards, pattern } = useRoomStore()

  const canStartGame = selectedCardIds.length > 0 && room?.status === "open"
  const gameInProgress = game?.status === "active" || room?.status === "in-game"

  const hasWinningCard = userCards.some((card) => (pattern ? checkWinningPattern(card, pattern) : false))

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {!gameInProgress ? (
          <StartGameButton disabled={!canStartGame} selectedCards={selectedCardIds.length} fee={room?.fee || 0} />
        ) : (
          <BingoClaimButton disabled={!hasWinningCard} hasWinningCard={hasWinningCard} />
        )}

        <div className="text-xs text-muted-foreground text-center space-y-1">
          {!gameInProgress ? (
            <>
              <p>Select 1-2 cards to join the game</p>
              <p>Entry fee will be charged when you start</p>
            </>
          ) : (
            <>
              <p>Mark numbers as they are called</p>
              <p>Click BINGO when you complete the pattern</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
