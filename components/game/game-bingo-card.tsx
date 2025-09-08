"use client"

import { useState, useEffect } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api/client"
import type { BingoCard } from "@/lib/types"

const BINGO_LETTERS = ["B", "I", "N", "G", "O"]

interface GameBingoCardProps {
  card: BingoCard
}

export function GameBingoCard({ card }: GameBingoCardProps) {
  const { calledNumbers, currentPattern } = useRoomStore()
  const [markedCells, setMarkedCells] = useState<Set<string>>(new Set(["2-2"])) // Center is free
  const [isClaimingBingo, setIsClaimingBingo] = useState(false)
  const [hasClaimed, setHasClaimed] = useState(false)

  useEffect(() => {
    if (card && card.marked) {
      const initialMarked = new Set<string>()
      card.marked.forEach((row, rowIndex) => {
        row.forEach((isMarked, colIndex) => {
          if (isMarked) {
            initialMarked.add(`${rowIndex}-${colIndex}`)
          }
        })
      })
      setMarkedCells(initialMarked)
    }
  }, [card])

  if (!card || !card.numbers || !Array.isArray(card.numbers)) {
    return (
      <div className="bg-card rounded-lg border p-3">
        <div className="text-center text-red-500">
          <span className="text-sm">Invalid card data</span>
        </div>
      </div>
    )
  }

  const cardNumbers = card.numbers.every((row) => Array.isArray(row) && row.length === 5)
    ? card.numbers
    : Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0))

  const handleCellClick = async (rowIndex: number, colIndex: number, number: number) => {
    console.log("[v0] Cell clicked:", { rowIndex, colIndex, number })

    if (rowIndex === 2 && colIndex === 2) return

    if (hasClaimed) {
      console.log("Game Over: You have already claimed BINGO and cannot mark more numbers.")
      return
    }

    const cellKey = `${rowIndex}-${colIndex}`
    const newMarkedCells = new Set(markedCells)

    if (newMarkedCells.has(cellKey)) {
      newMarkedCells.delete(cellKey)
      console.log("[v0] Cell unmarked:", cellKey)
    } else {
      newMarkedCells.add(cellKey)
      console.log("[v0] Cell marked:", cellKey)

      try {
        await apiClient.markCard("test-room-1", card.id.toString(), `${rowIndex}-${colIndex}`)
        console.log(`Number Marked: ${BINGO_LETTERS[colIndex]} ${number}`)
      } catch (error) {
        console.error("[v0] Error marking card:", error)
        console.log("Error: Failed to mark number. Please try again.")
      }
    }

    setMarkedCells(newMarkedCells)
  }

  const checkWinningPattern = () => {
    for (let row = 0; row < 5; row++) {
      let hasLine = true
      for (let col = 0; col < 5; col++) {
        const cellKey = `${row}-${col}`
        const isFree = row === 2 && col === 2
        if (!isFree && !markedCells.has(cellKey)) {
          hasLine = false
          break
        }
      }
      if (hasLine) return true
    }

    for (let col = 0; col < 5; col++) {
      let hasLine = true
      for (let row = 0; row < 5; row++) {
        const cellKey = `${row}-${col}`
        const isFree = row === 2 && col === 2
        if (!isFree && !markedCells.has(cellKey)) {
          hasLine = false
          break
        }
      }
      if (hasLine) return true
    }

    let hasDiagonal1 = true
    let hasDiagonal2 = true

    for (let i = 0; i < 5; i++) {
      const cellKey1 = `${i}-${i}`
      const cellKey2 = `${i}-${4 - i}`
      const isFree = i === 2

      if (!isFree && !markedCells.has(cellKey1)) {
        hasDiagonal1 = false
      }
      if (!isFree && !markedCells.has(cellKey2)) {
        hasDiagonal2 = false
      }
    }

    return hasDiagonal1 || hasDiagonal2
  }

  const hasWinningPattern = checkWinningPattern()

  const handleBingoClaim = async () => {
    if (isClaimingBingo || hasClaimed) return

    setIsClaimingBingo(true)
    console.log("[v0] BINGO button clicked for card:", card.id)

    try {
      const response = await apiClient.claimBingo({
        roomId: "test-room-1",
        cardId: card.id.toString(),
        pattern: currentPattern?.name || "line",
        playerId: "player-1", // Mock player ID
      })

      if (response.success && response.verified) {
        console.log(`🎉 BINGO VERIFIED! Card #${card.id} won $${response.prize}!`)
        setHasClaimed(true)
        console.log(`🎉 BINGO! 🎉 Congratulations! You won $${response.prize}!`)
      } else {
        console.log("❌ Bingo claim rejected")
        console.log("Invalid BINGO: Your claim was not verified. Please check your card pattern.")
      }
    } catch (error) {
      console.error("[v0] Error claiming bingo:", error)
      console.log("Error: Failed to claim BINGO. Please try again.")
    } finally {
      setIsClaimingBingo(false)
    }
  }

  return (
    <div className="bg-card rounded-lg border p-3">
      <div className="text-center mb-2">
        <span className="text-sm font-medium">Card #{card.id}</span>
        {hasClaimed && <div className="text-xs text-green-600 font-medium mt-1">✓ BINGO CLAIMED</div>}
      </div>

      <div className="grid grid-cols-5 gap-1 mb-2">
        {BINGO_LETTERS.map((letter) => (
          <div key={letter} className="bg-primary text-primary-foreground text-center py-1 rounded font-bold text-xs">
            {letter}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-1 mb-3">
        {cardNumbers.map((row, rowIndex) =>
          row.map((number, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`
            const isMarked = markedCells.has(cellKey)
            const isFree = rowIndex === 2 && colIndex === 2
            const isCalled = number === 0 || calledNumbers.includes(number)

            return (
              <button
                key={cellKey}
                onClick={() => {
                  console.log("[v0] Button clicked for cell:", cellKey, "number:", number)
                  handleCellClick(rowIndex, colIndex, number)
                }}
                disabled={hasClaimed}
                className={cn(
                  "aspect-square flex items-center justify-center rounded text-xs font-medium border-2 transition-all duration-200 cursor-pointer active:scale-95",
                  isFree
                    ? "bg-yellow-500 text-white border-yellow-600 cursor-pointer"
                    : isMarked
                      ? "bg-blue-500 text-white border-blue-600 shadow-md"
                      : isCalled
                        ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                        : hasClaimed
                          ? "bg-muted text-muted-foreground border-border opacity-50 cursor-not-allowed"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80",
                )}
              >
                {isFree ? "⭐" : number}
              </button>
            )
          }),
        )}
      </div>

      <Button
        size="sm"
        className={cn(
          "w-full transition-all duration-300 font-bold text-white shadow-lg",
          !hasClaimed && !isClaimingBingo
            ? "bg-red-600 hover:bg-red-700 active:bg-red-800 border-2 border-red-400 hover:shadow-xl active:scale-95"
            : hasClaimed
              ? "bg-green-600 border-2 border-green-400 cursor-not-allowed"
              : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed opacity-50",
        )}
        onClick={handleBingoClaim}
        disabled={hasClaimed || isClaimingBingo}
      >
        {isClaimingBingo ? "Claiming..." : hasClaimed ? "✓ BINGO CLAIMED" : "BINGO"}
      </Button>
    </div>
  )
}
