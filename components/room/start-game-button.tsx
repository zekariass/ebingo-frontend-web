// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { useRoomStore } from "@/lib/stores/room-store"
// import { usePaymentStore } from "@/lib/stores/payment-store"
// import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
// import { apiClient } from "@/lib/api/client"
// import { DollarSign, CreditCard, GraduationCap } from "lucide-react"
// import { useRouter } from "next/navigation"
// import { useToast } from "@/components/ui/use-toast"
// import { useGameStore } from "@/lib/stores/game-store"

// interface StartGameButtonProps {
//   disabled: boolean
//   selectedCards: number
//   fee: number
// }

// export function StartGameButton({ disabled, selectedCards, fee }: StartGameButtonProps) {
//   const [isOpen, setIsOpen] = useState(false)
//   const [isProcessing, setIsProcessing] = useState(false)
//   const { room } = useRoomStore()
//   const { game: {userSelectedCardsIds, userSelectedCards} } = useGameStore()
//   const { balance, setBalance } = usePaymentStore()
//   const router = useRouter()
//   const { toast } = useToast()

//   const { joinGame, connected } = useWebSocketEvents({
//     roomId: room?.id || -1,
//     enabled: true,
//   })

//   const totalCost = fee * selectedCards
//   const canAfford = balance.available >= totalCost

//   const isPracticeRoom = room?.id === "test-room-1"
//   const connectionRequired = !isPracticeRoom && !connected

//   const effectiveBalance = isPracticeRoom ? Math.max(balance.available, 1000) : balance.available
//   const effectiveCanAfford = isPracticeRoom || canAfford
//   const isButtonDisabled = selectedCards === 0 || (!effectiveCanAfford && !isPracticeRoom) || disabled

//   const handleStartGame = async () => {
//     if (!effectiveCanAfford) {
//       toast({
//         variant: "destructive",
//         title: "Insufficient Balance",
//         description: `You need $${totalCost.toFixed(2)} but only have $${balance.available.toFixed(2)}`,
//       })
//       return
//     }

//     if (!isPracticeRoom && !connected) {
//       toast({
//         title: "Connection Required",
//         description: "Please wait for connection to be established",
//       })
//       return
//     }

//     setIsProcessing(true)

//     try {
//       if (room?.id) {
//         const gameResponse = await apiClient.startGame(room.id, {
//           userBalance: balance.available,
//           selectedCards: userCards,
//           totalCost: isPracticeRoom ? 0 : totalCost,
//         })

//         if (!gameResponse.success) {
//           throw new Error(gameResponse.error || "Failed to start game")
//         }

//         if (gameResponse.data?.newBalance !== undefined && !isPracticeRoom) {
//           setBalance({
//             ...balance,
//             available: gameResponse.data.newBalance,
//             total: gameResponse.data.newBalance,
//           })
//         }

//         console.log("[v0] Game started:", gameResponse.data?.gameId)
//       }

//       if (room?.id && selectedCardIds.length > 0) {
//         await apiClient.joinRoom({
//           roomId: room.id,
//           cardIds: selectedCardIds.map((id) => id.toString()),
//         })
//         console.log("[v0] Joined room with cards:", selectedCardIds)
//       }

//       toast({
//         title: `${isPracticeRoom ? "Practice Game Started!" : "Game Started!"}`,
//         description: `Successfully joined with ${selectedCards} card${selectedCards > 1 ? "s" : ""}${isPracticeRoom ? " - Practice mode, no prizes awarded" : ""}`,
//       })

//       setIsOpen(false)
//       router.push(`/rooms/${room?.id}/game`)
//     } catch (error) {
//       console.error("Game Start Failed:", error)
//       toast({
//         variant: "destructive",
//         title: "Game Start Failed",
//         description: "Please try again or contact support",
//       })
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button
//           size="lg"
//           className="w-full"
//           disabled={isButtonDisabled}
//           variant={effectiveCanAfford ? "default" : "secondary"}
//         >
//           {isPracticeRoom ? <GraduationCap className="h-5 w-5 mr-2" /> : <DollarSign className="h-5 w-5 mr-2" />}
//           {isPracticeRoom ? "Start Practice Game" : "Start Game"}{" "}
//           {isPracticeRoom ? "(FREE)" : `($${totalCost.toFixed(2)})`}
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="pr-8">
//         <DialogHeader>
//           <DialogTitle>{isPracticeRoom ? "Start Practice Game" : "Confirm Game Entry"}</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           {isPracticeRoom && (
//             <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
//               <p className="text-green-700 dark:text-green-300 text-sm font-medium">
//                 🎓 Practice Mode: Learn bingo mechanics without cost. No prizes awarded.
//               </p>
//             </div>
//           )}

//           <div className="bg-muted p-4 rounded-lg space-y-2">
//             <div className="flex justify-between">
//               <span>Selected Cards:</span>
//               <span className="font-semibold">{selectedCards}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>Entry Fee per Card:</span>
//               <span className="font-semibold">{isPracticeRoom ? "FREE" : `$${fee.toFixed(2)}`}</span>
//             </div>
//             <div className="border-t pt-2 flex justify-between text-lg font-bold">
//               <span>Total Cost:</span>
//               <span>{isPracticeRoom ? "FREE (Practice)" : `$${totalCost.toFixed(2)}`}</span>
//             </div>
//           </div>

//           {!isPracticeRoom && (
//             <div className="flex justify-between items-center p-3 bg-card border rounded-lg">
//               <span>Current Balance:</span>
//               <span className={`font-semibold ${effectiveCanAfford ? "text-green-600" : "text-red-600"}`}>
//                 ${effectiveBalance.toFixed(2)}
//               </span>
//             </div>
//           )}

//           {!effectiveCanAfford && !isPracticeRoom && (
//             <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
//               <p className="text-red-700 dark:text-red-300 text-sm">
//                 Insufficient balance. Please add funds to your account.
//               </p>
//             </div>
//           )}

//           {connectionRequired && (
//             <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
//               <p className="text-yellow-700 dark:text-yellow-300 text-sm">
//                 Connection required. Please wait for connection to be established.
//               </p>
//             </div>
//           )}

//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               className="flex-1 bg-transparent"
//               onClick={() => setIsOpen(false)}
//               disabled={isProcessing}
//             >
//               Cancel
//             </Button>
//             <Button className="flex-1" onClick={handleStartGame} disabled={!effectiveCanAfford || isProcessing}>
//               {isProcessing ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   {isPracticeRoom ? (
//                     <GraduationCap className="h-4 w-4 mr-2" />
//                   ) : (
//                     <CreditCard className="h-4 w-4 mr-2" />
//                   )}
//                   {isPracticeRoom ? "Start Practice" : "Confirm & Pay"}
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRoomStore } from "@/lib/stores/room-store"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"
import { apiClient } from "@/lib/api/client"
import { DollarSign, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useGameStore } from "@/lib/stores/game-store"
import { userStore } from "@/lib/stores/user-store"

interface StartGameButtonProps {
  disabled: boolean
  selectedCards: number
  fee: number
}

export function StartGameButton({ disabled, selectedCards, fee }: StartGameButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { room } = useRoomStore()
  const { game: {gameId, userSelectedCardsIds, started} } = useGameStore()
  const userProfileId = userStore(state => state.user?.id)
  const { balance, setBalance } = usePaymentStore()
  const router = useRouter()
  const { toast } = useToast()

  const { connected, joinGame } = useWebSocketEvents({
    roomId: room?.id || -1,
    enabled: true,
  })

  const totalCost = fee * selectedCards
  const canAfford = balance.totalAvailableBalance >= totalCost

  const isButtonDisabled = selectedCards === 0 //|| !canAfford || disabled

  const handleStartGame = async () => {
    if (!canAfford) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You need $${totalCost.toFixed(2)} but only have $${balance.totalAvailableBalance.toFixed(2)}`,
      })
      return
    }

    if (!connected) {
      toast({
        title: "Connection Required",
        description: "Please wait for connection to be established",
      })
      return
    }

    setIsProcessing(true)

    try {
      // if (room?.id) {
      //   const gameResponse = await apiClient.startGame(room.id, {
      //     userBalance: balance.totalAvailableBalance,
      //     selectedCards,
      //     totalCost,
      //   })

      //   if (!gameResponse.success) {
      //     throw new Error(gameResponse.error || "Failed to start game")
      //   }

      //   if (gameResponse.data?.newBalance !== undefined) {
      //     setBalance({
      //       ...balance,
      //       available: gameResponse.data.newBalance,
      //       total: gameResponse.data.newBalance,
      //     })
      //   }

      //   console.log("[v0] Game started:", gameResponse.data?.gameId)
      // }

      // if (room?.id && userSelectedCardsIds.length > 0) {
      //   await apiClient.joinRoom({
      //     roomId: room.id,
      //     cardIds: userSelectedCardsIds.map((id) => id.toString()),
      //   })
      //   console.log("[v0] Joined room with cards:", userSelectedCardsIds)
      // }


      if (userProfileId != undefined){
        joinGame(gameId, fee)
      }else {
        throw new Error("userProfileId (playerId) is null or undefined!")
      }

      if (started){
        toast({
        title: "Game Started!",
        description: `Successfully joined with ${selectedCards} card${selectedCards > 1 ? "s" : ""}.`,
      })
      }

      setIsOpen(false)
      router.push(`/rooms/${room?.id}/game`)
    } catch (error) {
      console.error("Game Start Failed:", error)
      toast({
        variant: "destructive",
        title: "Game Start Failed",
        description: "Please try again or contact support",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full"
          disabled={isButtonDisabled}
          variant={canAfford ? "default" : "secondary"}
        >
          <DollarSign className="h-5 w-5 mr-2" />
          Start Game (${totalCost.toFixed(2)})
        </Button>
      </DialogTrigger>

      <DialogContent className="pr-8">
        <DialogHeader>
          <DialogTitle>Confirm Game Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Selected Cards:</span>
              <span className="font-semibold">{selectedCards}</span>
            </div>
            <div className="flex justify-between">
              <span>Entry Fee per Card:</span>
              <span className="font-semibold">${fee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total Cost:</span>
              <span>${totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-card border rounded-lg">
            <span>Current Balance:</span>
            <span className={`font-semibold ${canAfford ? "text-green-600" : "text-red-600"}`}>
              ${balance.totalAvailableBalance.toFixed(2)}
            </span>
          </div>

          {!canAfford && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">
                Insufficient balance. Please add funds to your account.
              </p>
            </div>
          )}

          {!connected && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                Connection required. Please wait for connection to be established.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setIsOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleStartGame} disabled={!canAfford || isProcessing}>
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Confirm & Pay
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
