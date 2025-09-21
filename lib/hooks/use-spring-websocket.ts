"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import type {
  WebSocketMessage,
  ClientMessage,
  ServerMessage,
  WebSocketConnectionState,
  WebSocketConfig,
  WebSocketEventType,
} from "@/lib/types/websocket"

interface UseSpringWebSocketOptions {
  gameId: string
  playerId: string
  playerName: string
  enabled?: boolean
  config?: Partial<WebSocketConfig>
}

type WebSocketEventHandler<T = any> = (payload: T, message: ServerMessage) => void

const DEFAULT_CONFIG: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws",
  reconnectInterval: 2000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
  connectionTimeout: 10000,
  enableLogging: true,
}

export function useSpringWebSocket({
  gameId,
  playerId,
  playerName,
  enabled = true,
  config: userConfig = {},
}: UseSpringWebSocketOptions) {
  const config = { ...DEFAULT_CONFIG, ...userConfig }

  // Refs for WebSocket and timers
  const wsRef = useRef<WebSocket | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventHandlersRef = useRef<Map<WebSocketEventType, Set<WebSocketEventHandler>>>(new Map())
  const pendingMessagesRef = useRef<ClientMessage[]>([])
  const lastPingRef = useRef<number>(0)

  // Connection state
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>({
    status: "disconnected",
    latency: 0,
    reconnectAttempts: 0,
    maxReconnectAttempts: config.maxReconnectAttempts,
  })

  // Logging utility
  const log = useCallback(
    (message: string, ...args: any[]) => {
      if (config.enableLogging) {
        console.log(`[SpringWebSocket] ${message}`, ...args)
      }
    },
    [config.enableLogging],
  )

  // Generate unique message ID
  const generateMessageId = useCallback(() => uuidv4(), [])

  // Send message to WebSocket
  const sendMessage = useCallback(
    <T extends ClientMessage>(message: Omit<T, "id" | "timestamp">) => {
      const fullMessage: WebSocketMessage = {
        id: generateMessageId(),
        type: message.type,
        payload: message.payload,
        timestamp: new Date().toISOString(),
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(fullMessage))
        log("Sent message:", fullMessage.type, fullMessage.payload)
        return true
      } else {
        // Queue message for when connection is restored
        pendingMessagesRef.current.push(message as ClientMessage)
        log("Queued message (not connected):", message.type)
        return false
      }
    },
    [generateMessageId, log],
  )

  // Send pending messages
  const sendPendingMessages = useCallback(() => {
    const messages = [...pendingMessagesRef.current]
    pendingMessagesRef.current = []

    messages.forEach((message) => {
      sendMessage(message)
    })

    if (messages.length > 0) {
      log("Sent pending messages:", messages.length)
    }
  }, [sendMessage, log])

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        lastPingRef.current = Date.now()
        sendMessage({
          type: "connection.ping",
          payload: { timestamp: new Date().toISOString() },
        })
      }
    }, config.heartbeatInterval)
  }, [sendMessage])

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: ServerMessage = JSON.parse(event.data)
        log("Received message:", message.type, message.payload)

        // Handle heartbeat response
        if (message.type === "connection.pong") {
          const latency = Date.now() - lastPingRef.current
          setConnectionState((prev) => ({
            ...prev,
            latency,
            lastHeartbeat: new Date(),
          }))
          return
        }

        // Trigger event handlers
        const handlers = eventHandlersRef.current.get(message.type)
        if (handlers) {
          handlers.forEach((handler) => {
            try {
              handler(message.payload, message)
            } catch (error) {
              console.error("Error in event handler:", error)
            }
          })
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    },
    [log],
  )

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    setConnectionState((prev) => ({
      ...prev,
      status: "connecting",
    }))

    try {
      const wsUrl = `${config.url}/game/${gameId}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      // Connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close()
          setConnectionState((prev) => ({
            ...prev,
            status: "error",
            lastError: "Connection timeout",
          }))
        }
      }, config.connectionTimeout)

      ws.onopen = () => {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
        }

        log("WebSocket connected to game:", gameId)

        setConnectionState((prev) => ({
          ...prev,
          status: "connected",
          reconnectAttempts: 0,
          connectedAt: new Date(),
          lastError: undefined,
        }))

        startHeartbeat()
        sendPendingMessages()

        // Send join message
        sendMessage({
          type: "game.join",
          payload: {
            gameId,
            playerId,
            playerName,
            cardIds: [], // Will be updated when cards are assigned
          },
        })
      }

      ws.onmessage = handleMessage

      ws.onclose = (event) => {
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
        }

        log("WebSocket disconnected:", event.code, event.reason)
        stopHeartbeat()

        setConnectionState((prev) => {
          const newState = {
            ...prev,
            status: "disconnected" as const,
            connectedAt: undefined,
            lastHeartbeat: undefined,
          }

          // Auto-reconnect if not a clean close and under max attempts
          if (event.code !== 1000 && enabled && prev.reconnectAttempts < config.maxReconnectAttempts) {
            const delay = Math.min(config.reconnectInterval * Math.pow(2, prev.reconnectAttempts), 30000)

            log(`Reconnecting in ${delay}ms (attempt ${prev.reconnectAttempts + 1}/${config.maxReconnectAttempts})`)

            reconnectTimeoutRef.current = setTimeout(() => {
              setConnectionState((current) => ({
                ...current,
                status: "reconnecting",
                reconnectAttempts: current.reconnectAttempts + 1,
              }))
              connect()
            }, delay)

            return {
              ...newState,
              status: "reconnecting",
            }
          }

          return newState
        })
      }

      ws.onerror = (error) => {
        log("WebSocket error:", error)
        setConnectionState((prev) => ({
          ...prev,
          status: "error",
          lastError: "Connection error",
        }))
      }
    } catch (error) {
      log("Failed to create WebSocket:", error)
      setConnectionState((prev) => ({
        ...prev,
        status: "error",
        lastError: "Failed to create connection",
      }))
    }
  }, [
    enabled,
    gameId,
    playerId,
    playerName,
    log,
    startHeartbeat,
    stopHeartbeat,
    sendPendingMessages,
    sendMessage,
    handleMessage,
  ])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
    }

    stopHeartbeat()

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect")
      wsRef.current = null
    }

    setConnectionState((prev) => ({
      ...prev,
      status: "disconnected",
      reconnectAttempts: 0,
      connectedAt: undefined,
      lastHeartbeat: undefined,
      lastError: undefined,
    }))
  }, [stopHeartbeat])

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      setConnectionState((prev) => ({
        ...prev,
        reconnectAttempts: 0,
      }))
      connect()
    }, 100)
  }, [disconnect, connect])

  // Event subscription
  const subscribe = useCallback(<T = any>(eventType: WebSocketEventType, handler: WebSocketEventHandler<T>) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set())
    }
    eventHandlersRef.current.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = eventHandlersRef.current.get(eventType)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(eventType)
        }
      }
    }
  }, [])

  // Game action helpers
  const gameActions = {
    joinGame: useCallback(
      (cardIds: string[]) => {
        return sendMessage({
          type: "game.join",
          payload: { gameId, playerId, playerName, cardIds },
        })
      },
      [sendMessage, gameId, playerId, playerName],
    ),

    leaveGame: useCallback(() => {
      return sendMessage({
        type: "game.leave",
        payload: { gameId, playerId },
      })
    }, [sendMessage, gameId, playerId]),

    markNumber: useCallback(
      (cardId: string, number: number, position: { row: number; col: number }) => {
        return sendMessage({
          type: "player.mark_number",
          payload: {
            gameId,
            playerId,
            cardId,
            number,
            position,
            timestamp: new Date().toISOString(),
          },
        })
      },
      [sendMessage, gameId, playerId],
    ),

    claimBingo: useCallback(
      (cardId: string, pattern: string, winningNumbers: number[]) => {
        return sendMessage({
          type: "player.claim_bingo",
          payload: {
            gameId,
            playerId,
            cardId,
            pattern,
            winningNumbers,
            claimTime: new Date().toISOString(),
          },
        })
      },
      [sendMessage, gameId, playerId],
    ),

    setReady: useCallback(
      (isReady: boolean) => {
        return sendMessage({
          type: "player.ready",
          payload: { gameId, playerId, isReady },
        })
      },
      [sendMessage, gameId, playerId],
    ),
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled && connectionState.status === "disconnected") {
      connect()
    } else if (!enabled && connectionState.status !== "disconnected") {
      disconnect()
    }
  }, [enabled, connect, disconnect, connectionState.status])

  return {
    // Connection state
    connectionState,
    isConnected: connectionState.status === "connected",
    isConnecting: connectionState.status === "connecting",
    isReconnecting: connectionState.status === "reconnecting",

    // Connection actions
    connect,
    disconnect,
    reconnect,

    // Messaging
    sendMessage,
    subscribe,

    // Game actions
    ...gameActions,
  }
}
