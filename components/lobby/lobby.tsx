"use client"

import { useEffect, useState } from "react"
import { useLobbyStore } from "@/lib/stores/lobby-store"
import { LobbyHeader } from "./lobby-header"
import { LobbyFilters } from "./lobby-filters"
import { RoomGrid } from "./room-grid"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { userStore } from "@/lib/stores/user-store"

export function Lobby() {
  const { rooms, loading, error, fetchRooms } = useLobbyStore()
  const {fetchPaymentMethods, fetchTransactions, fetchWallet} = usePaymentStore()
  const { fetchUserProfile} = userStore()

  const [currentTxnPage, setCurrentTxnPage] = useState<number>(1)
  const [currentTxnSize, setCurrentTxnSize] = useState<number>(10)

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])


  // Fetch all payment data
  async function fetchPaymentData() {
    await Promise.all([
      fetchUserProfile(),
      fetchWallet(true),
      fetchPaymentMethods(),
      fetchTransactions(currentTxnPage, currentTxnSize, true),
    ])  
  }


  useEffect(() => {
    fetchPaymentData()
  }, [])

  if (loading) {
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
          <LobbyFilters />
          <RoomGrid rooms={rooms} loading={loading} />
        </div>
      </main>
    </div>
  )
}
