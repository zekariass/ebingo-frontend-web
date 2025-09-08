"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRoomStore } from "@/lib/stores/room-store"
import type { WSEvent, WSMessage } from "@/lib/types"

interface UseRoomSocketOptions {
  roomId: string
  enabled?: boolean
}

interface SocketState {
  connected: boolean
  connecting: boolean
  error: string | null
  latencyMs: number
  reconnectAttempts: number
}

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws"
const MAX_RECONNECT_ATTEMPTS = 3
const INITIAL_RECONNECT_DELAY = 2000
const MAX_RECONNECT_DELAY = 10000
const HEARTBEAT_INTERVAL = 30000
const IS_DEVELOPMENT = process.env.NODE_ENV === "development"
const DISABLE_WS_IN_DEV = !process.env.NEXT_PUBLIC_WS_URL && IS_DEVELOPMENT

export function useRoomSocket({ roomId, enabled = true }: UseRoomSocketOptions) {
  const roomStore = useRoomStore()

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastPingRef = useRef<number>(0)
  const reconnectAttemptsRef = useRef<number>(0)
  const maxAttemptsReachedRef = useRef<boolean>(false)

  const roomStoreRef = useRef(roomStore)

  // Update refs when values change
  roomStoreRef.current = roomStore

  const [socketState, setSocketState] = useState<SocketState>({
    connected: DISABLE_WS_IN_DEV, // Set connected to true in dev mode without WS
    connecting: false,
    error: null,
    latencyMs: 0,
    reconnectAttempts: 0,
  })

  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback((attempts: number) => {
    const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, attempts), MAX_RECONNECT_DELAY)
    return delay + Math.random() * 1000
  }, [])

  // Send message to WebSocket
  const send = useCallback((message: Partial<WSMessage>) => {
    if (DISABLE_WS_IN_DEV) return false

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WSMessage = {
        type: message.type || "unknown",
        payload: message.payload || {},
        timestamp: new Date().toISOString(),
      }
      wsRef.current.send(JSON.stringify(fullMessage))
      return true
    }
    return false
  }, [])

  // Get column letter for bingo number
  const getColumnLetter = useCallback((number: number): string => {
    if (number >= 1 && number <= 15) return "B"
    if (number >= 16 && number <= 30) return "I"
    if (number >= 31 && number <= 45) return "N"
    if (number >= 46 && number <= 60) return "G"
    if (number >= 61 && number <= 75) return "O"
    return ""
  }, [])

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WSEvent = JSON.parse(event.data)
        const store = roomStoreRef.current

        // Handle pong for latency calculation
        if (message.type === "pong") {
          const latency = Date.now() - lastPingRef.current
          setSocketState((prev) => ({ ...prev, latencyMs: latency }))
          store.setLatency(latency)
          return
        }

        // Handle room and game events
        switch (message.type) {
          case "room.snapshot":
            store.setRoom(message.payload.room)
            store.setPlayers(message.payload.players?.length || 0)
            if (message.payload.game) {
              store.setGame(message.payload.game)
            }
            break

          case "room.playerJoined":
            store.setPlayers(store.players + 1)
            console.log(`Player Joined: ${message.payload.player.name} joined the room`)
            break

          case "room.playerLeft":
            store.setPlayers(Math.max(0, store.players - 1))
            break

          case "game.started":
            store.setGame(message.payload.game)
            store.setPattern(message.payload.game.pattern)
            store.setCalledNumbers([])
            console.log(`Game Started! Playing for: ${message.payload.game.pattern}`)
            break

          case "game.numberCalled":
            const newNumbers = [...store.calledNumbers, message.payload.number]
            store.setCalledNumbers(newNumbers)
            store.setCurrentNumber(message.payload.number)

            console.log(
              `${message.payload.number} Called! ${getColumnLetter(message.payload.number)}${message.payload.number}`,
            )
            break

          case "game.bingoClaimed":
            console.log("Bingo Claimed! Player claimed bingo - verifying...")
            break

          case "game.winnerDeclared":
            if (store.game) {
              store.setGame({
                ...store.game,
                winners: message.payload.winners,
                status: "finished",
              })
            }
            break

          case "game.nextCountdown":
            break

          case "cards.assigned":
            store.setUserCards(message.payload.cards)
            break

          case "payments.updated":
            store.setBalance(message.payload.balance)
            if (message.payload.transaction) {
              console.log(
                `${message.payload.transaction.status === "completed" ? "Payment Successful" : "Payment Failed"}: $${message.payload.transaction.amount} ${message.payload.transaction.type}`,
              )
            }
            break

          default:
            console.log("Unhandled WebSocket message:", message)
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    },
    [getColumnLetter], // Removed roomStore and toast from dependencies
  )

  // Start heartbeat ping
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        lastPingRef.current = Date.now()
        send({ type: "ping" })
      }
    }, HEARTBEAT_INTERVAL)
  }, [send])

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled || maxAttemptsReachedRef.current || DISABLE_WS_IN_DEV) return

    setSocketState((prev) => {
      if (prev.connecting) return prev
      return { ...prev, connecting: true, error: null }
    })

    try {
      const wsUrl = `${WS_BASE_URL}/rooms/${roomId}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("WebSocket connected to room:", roomId)
        reconnectAttemptsRef.current = 0
        maxAttemptsReachedRef.current = false
        setSocketState((prev) => ({
          ...prev,
          connected: true,
          connecting: false,
          error: null,
          reconnectAttempts: 0,
        }))

        roomStoreRef.current.setConnected(true) // Use ref instead of direct store access
        startHeartbeat()

        send({
          type: "room.join",
          payload: { roomId },
        })
      }

      ws.onmessage = handleMessage

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason)
        setSocketState((prev) => ({ ...prev, connected: false, connecting: false }))
        roomStoreRef.current.setConnected(false) // Use ref instead of direct store access
        stopHeartbeat()

        if (
          event.code !== 1000 &&
          enabled &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS &&
          !maxAttemptsReachedRef.current
        ) {
          const currentAttempts = reconnectAttemptsRef.current
          const delay = getReconnectDelay(currentAttempts)
          console.log(`Reconnecting in ${delay}ms (attempt ${currentAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1
            setSocketState((prev) => ({
              ...prev,
              reconnectAttempts: reconnectAttemptsRef.current,
            }))
            connect()
          }, delay)
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          maxAttemptsReachedRef.current = true
          setSocketState((prev) => ({
            ...prev,
            error: "Unable to connect to game server",
          }))
          console.log("Max reconnection attempts reached - stopping reconnection")
        }
      }

      ws.onerror = () => {
        // Silently handle WebSocket errors in development mode
        setSocketState((prev) => ({
          ...prev,
          error: "Connection error",
          connecting: false,
        }))
      }
    } catch (error) {
      console.error("Failed to create WebSocket:", error)
      setSocketState((prev) => ({
        ...prev,
        error: "Failed to connect",
        connecting: false,
      }))
    }
  }, [enabled, roomId, handleMessage, startHeartbeat, stopHeartbeat, send, getReconnectDelay]) // Removed roomStore from dependencies

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    stopHeartbeat()

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect")
      wsRef.current = null
    }

    reconnectAttemptsRef.current = 0
    setSocketState({
      connected: DISABLE_WS_IN_DEV, // Keep connected true in dev mode
      connecting: false,
      error: null,
      latencyMs: 0,
      reconnectAttempts: 0,
    })

    roomStoreRef.current.setConnected(DISABLE_WS_IN_DEV) // Use ref instead of direct store access
  }, [stopHeartbeat]) // Removed roomStore from dependencies

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (DISABLE_WS_IN_DEV) return // Skip reconnect in dev mode

    maxAttemptsReachedRef.current = false
    reconnectAttemptsRef.current = 0
    disconnect()
    setTimeout(() => connect(), 100)
  }, [disconnect, connect])

  useEffect(() => {
    if (DISABLE_WS_IN_DEV) {
      roomStoreRef.current.setConnected(true)
      return
    }

    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, roomId]) // Only depend on enabled and roomId to prevent infinite loops

  return {
    ...socketState,
    send,
    connect,
    disconnect,
    reconnect,
    isDevelopmentMode: DISABLE_WS_IN_DEV,
  }
}
