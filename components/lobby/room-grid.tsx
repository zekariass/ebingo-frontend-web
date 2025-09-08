"use client"

import { useMemo } from "react"
import { useLobbyStore } from "@/lib/stores/lobby-store"
import type { Room } from "@/lib/types"
import { RoomCarousel } from "./room-carousel"

interface RoomGridProps {
  rooms: Room[]
  loading: boolean
}

export function RoomGrid({ rooms, loading }: RoomGridProps) {
  const { filters } = useLobbyStore()

  const safeRooms = Array.isArray(rooms) ? rooms : []

  const filteredRooms = useMemo(() => {
    return safeRooms.filter((room) => {
      // Fee filter
      if (filters.fee && room.fee !== filters.fee) {
        return false
      }

      // Status filter
      if (filters.status && room.status !== filters.status) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return room.name.toLowerCase().includes(searchLower)
      }

      return true
    })
  }, [safeRooms, filters])

  const { testRooms, regularRooms } = useMemo(() => {
    const test = filteredRooms.filter((room) => room.id === "test-room-1")
    const regular = filteredRooms.filter((room) => room.id !== "test-room-1")
    return { testRooms: test, regularRooms: regular }
  }, [filteredRooms])

  const roomsByFee = useMemo(() => {
    const grouped = regularRooms.reduce(
      (acc, room) => {
        if (!acc[room.fee]) {
          acc[room.fee] = []
        }
        acc[room.fee].push(room)
        return acc
      },
      {} as Record<number, Room[]>,
    )

    // Sort by fee ascending
    return Object.entries(grouped)
      .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
      .map(([fee, rooms]) => ({
        fee: Number.parseInt(fee),
        rooms: rooms.sort((a, b) => {
          // Sort by status priority: open > starting > in-game
          const statusPriority = { open: 0, starting: 1, "in-game": 2 }
          const aPriority = statusPriority[a.status]
          const bPriority = statusPriority[b.status]
          if (aPriority !== bPriority) return aPriority - bPriority

          // Then by occupancy (less full first for open rooms)
          return a.players / a.capacity - b.players / b.capacity
        }),
      }))
  }, [regularRooms])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">Loading rooms...</div>
      </div>
    )
  }

  if (testRooms.length === 0 && roomsByFee.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-muted-foreground">No rooms found</h3>
        <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or check back later</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {testRooms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">🧪 Test Room</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Demo Mode</span>
          </div>
          <RoomCarousel fee={10} rooms={testRooms} />
        </div>
      )}

      {roomsByFee.length > 0 && (
        <>
          {testRooms.length > 0 && <div className="border-t border-border" />}
          {roomsByFee.map(({ fee, rooms }) => (
            <RoomCarousel key={fee} fee={fee} rooms={rooms} />
          ))}
        </>
      )}
    </div>
  )
}
