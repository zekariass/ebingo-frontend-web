import { type NextRequest, NextResponse } from "next/server"
import { gameState } from "@/lib/backend/game-state"
import type { ApiResponse } from "@/lib/backend/types"

export async function GET() {
  try {
    const rooms = gameState.getAllRooms().map((room) => ({
      id: room.id,
      name: room.name,
      fee: room.fee,
      players: room.players.length,
      capacity: room.capacity,
      status: room.status,
      nextStartAt: room.nextStartAt,
    }))

    const response: ApiResponse = {
      success: true,
      data: rooms,
      error: null,
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, fee, capacity, nextStartAt } = body

    if (!name || !fee || !capacity) {
      const response: ApiResponse = {
        success: false,
        error: "Missing required fields: name, fee, capacity",
      }
      return NextResponse.json(response, { status: 400 })
    }

    const roomId = `room_${Date.now()}`
    const room = gameState.createRoom({
      id: roomId,
      name,
      fee,
      capacity,
      nextStartAt,
    })

    const response: ApiResponse = {
      success: true,
      data: room,
      error: null,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
