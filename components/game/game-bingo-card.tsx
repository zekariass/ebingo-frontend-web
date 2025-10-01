// "use client"

// import { useEffect, useState } from "react"
// import { useRoomStore } from "@/lib/stores/room-store"
// import { useGameStore } from "@/lib/stores/game-store"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { cn } from "@/lib/utils"
// import { CardInfo, BingoColumn } from "@/lib/types"
// import { useRoomSocket } from "@/lib/hooks/websockets/use-room-socket"
// import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"

// const COLUMN_HEADERS = ["B", "I", "N", "G", "O"]

// // Utility: normalize card into 5x5 grid
// function transformCardData(card?: Partial<Record<BingoColumn, number[]>>) {
//   const columns = [BingoColumn.B, BingoColumn.I, BingoColumn.N, BingoColumn.G, BingoColumn.O]

//   if (!card) {
//     return Array.from({ length: 5 }, () => Array(5).fill(0))
//   }

//   const grid = Array.from({ length: 5 }, (_, row) =>
//     columns.map((col) => card[col]?.[row] ?? 0)
//   )

//   // Free space center
//   grid[2][2] = 0
//   return grid
// }

// interface SelectedCardsViewProps {
//   cardInfoId: string
//   index: number
// }

// export function GameBingoCard({ cardInfoId, index }: SelectedCardsViewProps) {
//   const { connected } = useRoomStore()
//   const {
//     game: { gameId, drawnNumbers, roomId },
//     getCurrentCardById,
//     addMarkedNumberToCard,
//     removeMarkedNumberFromCard,
//     // claimBingo,
//   } = useGameStore()

//   const {markNumber, unmarkNumber} = useWebSocketEvents({roomId, enabled: true})

//   const [currentCard, setCurrentCard] = useState<CardInfo | null>(null)

//   useEffect(() => {
//         setCurrentCard(getCurrentCardById(cardInfoId))
//       }, [cardInfoId, getCurrentCardById])

//       if (!currentCard) return null

//       const cardNumbers = transformCardData(currentCard.numbers)

//   const isNumberDrawn = (num: number) => !drawnNumbers.includes(num)
//   const isMarked = (num: number) => currentCard.markedNumbers?.includes(num)

//   const handleCellClick = (num: number, row: number, col: number) => {
//         const free = row === 2 && col === 2
//         if (free || num === 0) return
//         // if (!isNumberDrawn(num)) return

//         // console.log("=======================>>>>CURRENT CARD===========>: ", cardNumbers)

//         if (isMarked(num)) {
//           removeMarkedNumberFromCard(currentCard.cardId, num)
//           unmarkNumber(gameId, cardInfoId, num)
//         } else {
//           addMarkedNumberToCard(currentCard.cardId, num)
//           markNumber(gameId, cardInfoId, num)
//         }
//   }

//   const handleBingoClaim = () => {
//     if (!connected) return
//     // claimBingo(currentCard.cardId)
//   }

//   return (
//     <div className="border rounded-lg p-1 w-full max-w-xs mx-auto">
//       {/* Card header */}
//       <div className="flex items-center justify-center mb-2 gap-2">
//         <Badge variant="outline" className="font-mono text-xs">
//           Card #{index + 1}
//         </Badge>
//         {!connected && (
//           <Badge variant="destructive" className="text-xs">
//             Offline
//           </Badge>
//         )}
//       </div>

//       {/* Column headers */}
//       <div className="grid grid-cols-5 gap-0.5 mb-2">
//         {COLUMN_HEADERS.map((letter) => (
//           <div
//             key={letter}
//             className="h-4 md:h-8 flex items-center justify-center font-bold bg-primary text-primary-foreground rounded"
//           >
//             {letter}
//           </div>
//         ))}
//       </div>

//       {/* Numbers grid */}
//       <div className="grid grid-cols-5 gap-0.5">
//         {cardNumbers.map((row, rowIndex) =>
//           row.map((num, colIndex) => {
//             const free = rowIndex === 2 && colIndex === 2
//             const marked = isMarked(num) || free
//             const clickable = connected && !free // && isNumberDrawn(num)

//             return (
//               <Button
//                 key={`${rowIndex}-${colIndex}`}
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handleCellClick(num, rowIndex, colIndex)}
//                 disabled={!clickable}
//                 className={cn(
//                   "h-6 md:h-10 w-full text-xs sm:text-sm font-semibold relative rounded-xs cursor-pointer",
//                   free && "bg-yellow-200 dark:bg-yellow-800 border-yellow-400 cursor-default",
//                   marked && !free && "bg-blue-500 text-white border-blue-600",
//                   !marked && clickable && "hover:bg-green-300 dark:hover:bg-green-900 border-green-300",
//                   !marked && !clickable && "opacity-50 cursor-not-allowed"
//                 )}
//               >
//                 {free ? "⭐" : num}
//                 {marked && !free && (
//                   <span className="absolute inset-0 flex items-center justify-center text-white">
//                     ✓
//                   </span>
//                 )}
//               </Button>
//             )
//           })
//         )}
//       </div>

//       {/* Claim button */}
//       <div className="mt-3">
//         <Button
//           onClick={handleBingoClaim}
//           disabled={!connected}
//           className="h-7 w-full font-bold text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white cursor-pointer"
//         >
//           Claim Bingo
//         </Button>
//       </div>
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import { useGameStore } from "@/lib/stores/game-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CardInfo, BingoColumn } from "@/lib/types"
import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"

const COLUMN_HEADERS = ["B", "I", "N", "G", "O"]

// Utility: normalize card into 5x5 grid
function transformCardData(card?: Partial<Record<BingoColumn, number[]>>) {
  const columns = [BingoColumn.B, BingoColumn.I, BingoColumn.N, BingoColumn.G, BingoColumn.O]

  if (!card) {
    return Array.from({ length: 5 }, () => Array(5).fill(0))
  }

  const grid = Array.from({ length: 5 }, (_, row) =>
    columns.map((col) => card[col]?.[row] ?? 0)
  )

  // Free space center
  grid[2][2] = 0
  return grid
}

interface SelectedCardsViewProps {
  cardInfoId: string
  index: number
}

export function GameBingoCard({ cardInfoId, index }: SelectedCardsViewProps) {
  const { connected } = useRoomStore()
  const {
    game: { gameId, drawnNumbers, roomId },
    addMarkedNumberToCard,
    removeMarkedNumberFromCard,
  } = useGameStore()

  const {markNumber: markNumberInBackend, unmarkNumber: unMarkNumberInBackend} = useWebSocketEvents({roomId, enabled: true})

  // ✅ Subscribe directly so it re-renders when card changes
  const currentCard = useGameStore((state) =>
    state.game.userSelectedCards?.find((card) => card.cardId === cardInfoId)
  )

  if (!currentCard) return null

  const cardNumbers = transformCardData(currentCard.numbers)

  const isNumberDrawn = (num: number) => drawnNumbers.includes(num)
  const isMarked = (num: number) => currentCard.marked?.includes(num)

  const handleCellClick = (num: number, row: number, col: number) => {
    const free = row === 2 && col === 2
    if (free || num === 0) return
    if (!isNumberDrawn(num)) return

    if (isMarked(num)) {
      removeMarkedNumberFromCard(currentCard.cardId, num)
      unMarkNumberInBackend(gameId, cardInfoId, num)
    } else {
      addMarkedNumberToCard(currentCard.cardId, num)
      markNumberInBackend(gameId, cardInfoId, num)
    }
  }

  //console.log("=================CURRENT CARD=======>>>>", currentCard)

  return (
    <div className="border rounded-lg p-1 w-full max-w-xs mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center mb-2 gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          Card #{index + 1}
        </Badge>
        {!connected && (
          <Badge variant="destructive" className="text-xs">
            Offline
          </Badge>
        )}
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-5 gap-0.5 mb-2">
        {COLUMN_HEADERS.map((letter) => (
          <div
            key={letter}
            className="h-4 md:h-8 flex items-center justify-center font-bold bg-primary text-primary-foreground rounded"
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-5 gap-0.5">
        {cardNumbers.map((row, rowIndex) =>
          row.map((num, colIndex) => {
            const free = rowIndex === 2 && colIndex === 2
            const marked = isMarked(num) || free
            const clickable = connected && !free && isNumberDrawn(num)

            // console.log(`=========================>>>${num} IS MARKED =========>>: `, marked)

            return (
              <Button
                key={`${rowIndex}-${colIndex}`}
                variant="outline"
                size="sm"
                onClick={() => handleCellClick(num, rowIndex, colIndex)}
                disabled={!clickable}
                className={`
                    h-6 md:h-10 w-full text-xs sm:text-sm font-semibold relative rounded-xs cursor-pointer
                    ${free ? "bg-yellow-200 dark:bg-yellow-800 border-yellow-400 cursor-default" : ""}
                    ${!marked && clickable ? "bg-green-300 hover:bg-green-300 dark:hover:bg-green-900 border-green-300" : ""}
                    ${!marked && !clickable ? "opacity-50 cursor-not-allowed" : ""}
                    ${marked && !free ? "!bg-violet-950 !text-white !border-blue-600" : ""}
                  `}
              >
                {free ? "⭐" : num}
              </Button>
            )
          })
        )}
      </div>
    </div>
  )
}
