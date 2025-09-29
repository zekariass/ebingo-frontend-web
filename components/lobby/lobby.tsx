"use client"

import { useEffect, useState } from "react"
import { useLobbyStore } from "@/lib/stores/lobby-store"
import { useRoomStore } from "@/lib/stores/room-store"
import { LobbyHeader } from "./lobby-header"
import { LobbyFilters } from "./lobby-filters"
import { RoomGrid } from "./room-grid"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { useUserProfile } from "@/hooks/use-user-profile"
import { userStore } from "@/lib/stores/user-store"

export function Lobby() {
  const { rooms, loading, error, fetchRooms } = useLobbyStore()
  const {fetchPaymentMethods, fetchTransactions, fetchWallet} = usePaymentStore()
  const { fetchUserProfile} = userStore()

  const [currentTxnPage, setCurrentTxnPage] = useState<number>(1)
  const [currentTxnSize, setCurrentTxnSize] = useState<number>(10)

  // const {} = useUserProfile()
  // const { balance } = useRoomStore()

  useEffect(() => {
    fetchRooms()

    // Refresh rooms every 30 seconds
    // const interval = setInterval(fetchRooms, 30000)
    // return () => clearInterval(interval)
  }, [fetchRooms])


  // Fetch all payment data
  async function fetchPaymentData() {
    await Promise.all([
      fetchUserProfile(),
      fetchWallet(),
      fetchPaymentMethods(),
      fetchTransactions(currentTxnPage, currentTxnSize),
    ])  
  }


  useEffect(() => {
    fetchPaymentData()
  }, [])

  if (loading && rooms && rooms.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <LobbyHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-muted-foreground">Loading rooms...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <LobbyHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* <div className="text-center space-y-2">
            <h5 className="text-xl font-bold text-balance">Multiplayer Bingo Rooms</h5>
            <p className="text-xl text-muted-foreground text-pretty">
              Join real money 75-ball bingo games with players worldwide
            </p>
            {balance > 0 && <p className="text-lg font-semibold text-primary">Your Balance: ${balance.toFixed(2)}</p>}
          </div> */}

          <LobbyFilters />
          <RoomGrid rooms={rooms} loading={loading} />
        </div>
      </main>
    </div>
  )
}
