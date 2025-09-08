"use client"

import { useCallback } from "react"
import { useRoomSocket } from "./use-room-socket"
import type { BingoClaimRequest } from "@/lib/types"

interface UseWebSocketEventsOptions {
  roomId: string
  enabled?: boolean
}

export function useWebSocketEvents({ roomId, enabled = true }: UseWebSocketEventsOptions) {
  const socket = useRoomSocket({ roomId, enabled })

  // Join room
  const joinRoom = useCallback(
    (cardIds: number[]) => {
      return socket.send({
        type: "room.join",
        payload: { roomId, cardIds },
      })
    },
    [socket, roomId],
  )

  // Leave room
  const leaveRoom = useCallback(() => {
    return socket.send({
      type: "room.leave",
      payload: { roomId },
    })
  }, [socket, roomId])

  // Start game (ready up)
  const startGame = useCallback(
    (cardIds: number[]) => {
      return socket.send({
        type: "game.ready",
        payload: { roomId, cardIds },
      })
    },
    [socket, roomId],
  )

  // Claim bingo
  const claimBingo = useCallback(
    (request: BingoClaimRequest) => {
      return socket.send({
        type: "game.bingo",
        payload: request,
      })
    },
    [socket],
  )

  // Request room snapshot
  const requestSnapshot = useCallback(() => {
    return socket.send({
      type: "room.getSnapshot",
      payload: { roomId },
    })
  }, [socket, roomId])

  // Mark card number (for validation)
  const markNumber = useCallback(
    (cardId: number, number: number) => {
      return socket.send({
        type: "card.mark",
        payload: { roomId, cardId, number },
      })
    },
    [socket, roomId],
  )

  return {
    // Socket state
    connected: socket.connected,
    connecting: socket.connecting,
    error: socket.error,
    latencyMs: socket.latencyMs,
    reconnectAttempts: socket.reconnectAttempts,

    // Socket actions
    connect: socket.connect,
    disconnect: socket.disconnect,
    reconnect: socket.reconnect,

    // Game actions
    joinRoom,
    leaveRoom,
    startGame,
    claimBingo,
    requestSnapshot,
    markNumber,
  }
}
