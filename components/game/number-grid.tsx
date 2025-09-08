"use client"

import { useRoomStore } from "@/lib/stores/room-store"
import { cn } from "@/lib/utils"

const BINGO_LETTERS = ["B", "I", "N", "G", "O"]

const generateNumberGrid = () => {
  const grid: number[][] = [[], [], [], [], []]

  // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
  for (let col = 0; col < 5; col++) {
    const start = col * 15 + 1
    const end = start + 14

    for (let num = start; num <= end; num++) {
      grid[col].push(num)
    }
  }

  return grid
}

export function NumberGrid() {
  const { calledNumbers } = useRoomStore()
  const numberGrid = generateNumberGrid()

  return (
    <div className="bg-card rounded-lg border p-2 sm:p-4">
      <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center text-primary">75 Number Grid</h2>

      <div className="grid grid-cols-5 gap-0.5 sm:gap-1 mb-3">
        {BINGO_LETTERS.map((letter) => (
          <div
            key={letter}
            className="bg-primary text-primary-foreground text-center py-2 sm:py-3 rounded-md font-bold text-sm sm:text-lg shadow-sm"
          >
            {letter}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
        {numberGrid.map((column, colIndex) => (
          <div key={colIndex} className="space-y-0.5 sm:space-y-1">
            {column.map((number) => {
              const isCalled = calledNumbers.includes(number)
              return (
                <div
                  key={number}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded text-xs font-medium border-2 transition-all duration-300",
                    isCalled
                      ? "bg-green-500 text-white border-green-600 shadow-md"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50",
                  )}
                >
                  {number}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
