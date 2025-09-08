"use client"

import { useRoomStore } from "@/lib/stores/room-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CardSelectionGridProps {
  roomId: string
  capacity: number
}

export function CardSelectionGrid({ roomId, capacity }: CardSelectionGridProps) {
  const { selectedCardIds, selectCard, deselectCard, room } = useRoomStore()

  const maxCards = 2

  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = 100
  const totalCards = capacity
  const totalPages = Math.ceil(totalCards / cardsPerPage)

  const availableCards = useMemo(() => {
    const startIndex = (currentPage - 1) * cardsPerPage
    const endIndex = Math.min(startIndex + cardsPerPage, totalCards)
    return Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i + 1)
  }, [totalCards, currentPage, cardsPerPage])

  // Mock taken cards (simulate other players' selections)
  const takenCards = useMemo(() => {
    const taken = new Set<number>()
    const numTaken = Math.floor(Math.random() * (totalCards * 0.15)) // 0-15% taken for better availability

    while (taken.size < numTaken) {
      const cardId = Math.floor(Math.random() * totalCards) + 1
      taken.add(cardId)
    }

    return taken
  }, [totalCards])

  const handleCardClick = (cardId: number) => {
    if (takenCards.has(cardId)) return

    if (selectedCardIds.includes(cardId)) {
      deselectCard(cardId)
    } else if (selectedCardIds.length < maxCards) {
      selectCard(cardId)
    }
  }

  const getCardStatus = (cardId: number) => {
    if (takenCards.has(cardId)) return "taken"
    if (selectedCardIds.includes(cardId)) return "selected"
    return "available"
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-1 sm:pb-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          {/* <CardTitle className="text-lg sm:text-xl">Select Your Cards</CardTitle> */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <Badge variant="outline" className="w-fit">
              {selectedCardIds.length}/{maxCards} selected
            </Badge>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full" />
                <span className="text-muted-foreground text-xs">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full" />
                <span className="text-muted-foreground text-xs">Selected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full" />
                <span className="text-muted-foreground text-xs">Taken</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground">
            Choose up to {maxCards} cards to play with. Click on a card number to select or deselect it.
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage === 1}>
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages}>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-3">
        {totalPages > 1 && (
          <div className="mb-3 text-xs text-muted-foreground text-center">
            Showing cards {(currentPage - 1) * cardsPerPage + 1} - {Math.min(currentPage * cardsPerPage, totalCards)} of{" "}
            {totalCards}
          </div>
        )}

        <div className="grid grid-cols-8 xs:grid-cols-10 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-18 xl:grid-cols-20 gap-0.5 sm:gap-0.5 max-h-[60vh] overflow-y-auto">
          {availableCards.map((cardId) => {
            const status = getCardStatus(cardId)

            return (
              <Button
                key={cardId}
                variant="outline"
                className={`
                  aspect-square w-full relative transition-all duration-200 text-[14px] xs:text-xs font-semibold h-6 xs:h-7 sm:h-8 min-h-0 p-0 rounded-xs
                  ${
                    status === "selected"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950 ring-1 sm:ring-2 ring-blue-500 text-blue-700 dark:text-blue-300"
                      : status === "taken"
                        ? "border-red-300 bg-red-300 dark:bg-red-950 cursor-not-allowed opacity-50 text-white-100"
                        : "border-green-500 bg-green-50 dark:bg-green-950 text-white-700 dark:text-white-900 hover:bg-green-100 dark:hover:bg-green-950"
                  }
                  ${selectedCardIds.length >= maxCards && status === "available" ? "opacity-50" : ""}
                `}
                onClick={() => handleCardClick(cardId)}
                disabled={status === "taken" || (selectedCardIds.length >= maxCards && status === "available")}
              >
                {cardId}

                {status === "selected" && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] sm:text-[10px]">✓</span>
                  </div>
                )}
              </Button>
            )
          })}
        </div>

        {selectedCardIds.length >= maxCards && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              You have selected the maximum of {maxCards} cards. Deselect a card to choose a different one.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
