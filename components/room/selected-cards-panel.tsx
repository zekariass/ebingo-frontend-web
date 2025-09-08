"use client"

import { useRoomStore } from "@/lib/stores/room-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractiveBingoCard } from "./interactive-bingo-card"

export function SelectedCardsPanel() {
  const { userCards } = useRoomStore()

  if (userCards.length === 0) {
    return null
  }

  return (
    <Card className="p-0">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg pt-2">Your Selected Cards ({userCards.length}/2)</CardTitle>
        {/* <p className="text-xs sm:text-sm text-muted-foreground">
          Click on numbers that have been called to mark them on your cards.
        </p> */}
      </CardHeader>

      <CardContent className="p-2 sm:p-4">
        <div
          className={`grid gap-1 sm:gap-2 md:gap-4 w-full ${userCards.length === 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"
            }`}
        >
          {userCards.map((card) => (
            <div key={card.id} className="w-full">
              <InteractiveBingoCard card={card} />
            </div>
          ))}
          {userCards.length === 1 && (
            <div className="w-full flex items-center justify-center border-2 border-dashed border-muted rounded-lg min-h-[200px] sm:min-h-[250px] md:min-h-[300px] hidden sm:flex">
              <p className="text-muted-foreground text-xs sm:text-sm text-center px-2">
                Select a second card to play with
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
