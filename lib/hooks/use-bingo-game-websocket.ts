"use client"

import { useCallback, useEffect, useState } from "react"
import { useSpringWebSocket } from "./use-spring-websocket"
import { useToast } from "@/components/ui/use-toast"
import type {
  GameStatePayload,
  NumberCalledPayload,
  GamePlayer,
  GameWinner,
  PlayerMarkPayload,
  BingoClaimPayload,
} from "@/lib/types/websocket"

interface UseBingoGameWebSocketOptions {
  gameId: string
  playerId: string
  playerName: string
  enabled?: boolean
  onNumberCalled?: (payload: NumberCalledPayload) => void
  onGameStateUpdate?: (payload: GameStatePayload) => void
  onPlayerJoined?: (player: GamePlayer) => void
  onPlayerLeft?: (playerId: string) => void
  onPlayerMarked?: (payload: PlayerMarkPayload) => void
  onBingoClaimed?: (payload: BingoClaimPayload) => void
  onWinnerDeclared?: (winners: GameWinner[]) => void
}

interface BingoGameState {
  gameId: string
  status: "waiting" | "starting" | "active" | "paused" | "finished"
  currentNumber?: number
  calledNumbers: number[]
  players: GamePlayer[]
  winners: GameWinner[]
  nextNumberIn?: number
  lastUpdated: Date
}

export function useBingoGameWebSocket({
  gameId,
  playerId,
  playerName,
  enabled = true,
  onNumberCalled,
  onGameStateUpdate,
  onPlayerJoined,
  onPlayerLeft,
  onPlayerMarked,
  onBingoClaimed,
  onWinnerDeclared,
}: UseBingoGameWebSocketOptions) {
  const { toast } = useToast()

  // Game state
  const [gameState, setGameState] = useState<BingoGameState>({
    gameId,
    status: "waiting",
    calledNumbers: [],
    players: [],
    winners: [],
    lastUpdated: new Date(),
  })

  // WebSocket connection
  const {
    connectionState,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    reconnect,
    subscribe,
    joinGame,
    leaveGame,
    markNumber,
    claimBingo,
    setReady,
  } = useSpringWebSocket({
    gameId,
    playerId,
    playerName,
    enabled,
  })

  // Handle number called events
  useEffect(() => {
    return subscribe<NumberCalledPayload>("game.number_called", (payload) => {
      setGameState((prev) => ({
        ...prev,
        currentNumber: payload.number,
        calledNumbers: payload.calledNumbers,
        lastUpdated: new Date(),
      }))

      // Show toast notification
      toast({
        title: `${payload.letter}${payload.number}`,
        description: `Number called: ${payload.letter}-${payload.number}`,
        variant: "default",
      })

      onNumberCalled?.(payload)
    })
  }, [subscribe, toast, onNumberCalled])

  // Handle game state updates
  useEffect(() => {
    return subscribe<GameStatePayload>("game.state_updated", (payload) => {
      setGameState((prev) => ({
        ...prev,
        status: payload.status,
        currentNumber: payload.currentNumber,
        calledNumbers: payload.calledNumbers,
        players: payload.players,
        winners: payload.winners || [],
        nextNumberIn: payload.nextNumberIn,
        lastUpdated: new Date(),
      }))

      onGameStateUpdate?.(payload)
    })
  }, [subscribe, onGameStateUpdate])

  // Handle player joined events
  useEffect(() => {
    return subscribe<{ gameId: string; player: GamePlayer }>("player.joined", ({ player }) => {
      setGameState((prev) => ({
        ...prev,
        players: [...prev.players.filter((p) => p.id !== player.id), player],
        lastUpdated: new Date(),
      }))

      toast({
        title: "Player Joined",
        description: `${player.name} joined the game`,
        variant: "default",
      })

      onPlayerJoined?.(player)
    })
  }, [subscribe, toast, onPlayerJoined])

  // Handle player left events
  useEffect(() => {
    return subscribe<{ gameId: string; playerId: string }>("player.left", ({ playerId: leftPlayerId }) => {
      setGameState((prev) => {
        const leftPlayer = prev.players.find((p) => p.id === leftPlayerId)
        return {
          ...prev,
          players: prev.players.filter((p) => p.id !== leftPlayerId),
          lastUpdated: new Date(),
        }
      })

      onPlayerLeft?.(leftPlayerId)
    })
  }, [subscribe, onPlayerLeft])

  // Handle player marked number events
  useEffect(() => {
    return subscribe<PlayerMarkPayload>("player.marked_number", (payload) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((player) =>
          player.id === payload.playerId
            ? {
                ...player,
                markedNumbers: {
                  ...player.markedNumbers,
                  [payload.cardId]: [...(player.markedNumbers[payload.cardId] || []), payload.number].filter(
                    (num, index, arr) => arr.indexOf(num) === index,
                  ), // Remove duplicates
                },
              }
            : player,
        ),
        lastUpdated: new Date(),
      }))

      onPlayerMarked?.(payload)
    })
  }, [subscribe, onPlayerMarked])

  // Handle bingo claimed events
  useEffect(() => {
    return subscribe<BingoClaimPayload>("player.claimed_bingo", (payload) => {
      toast({
        title: "BINGO Claimed!",
        description: `A player claimed BINGO with pattern: ${payload.pattern}`,
        variant: "default",
      })

      onBingoClaimed?.(payload)
    })
  }, [subscribe, toast, onBingoClaimed])

  // Handle winner declared events
  useEffect(() => {
    return subscribe<{ gameId: string; winners: GameWinner[] }>("winner.declared", ({ winners }) => {
      setGameState((prev) => ({
        ...prev,
        winners,
        status: "finished",
        lastUpdated: new Date(),
      }))

      const winnerNames = winners.map((w) => w.playerName).join(", ")
      toast({
        title: "Game Finished!",
        description: `Winners: ${winnerNames}`,
        variant: "default",
      })

      onWinnerDeclared?.(winners)
    })
  }, [subscribe, toast, onWinnerDeclared])

  // Enhanced game actions with state updates
  const gameActions = {
    joinGame: useCallback(
      async (cardIds: string[]) => {
        const success = joinGame(cardIds)
        if (success) {
          setGameState((prev) => ({
            ...prev,
            players: prev.players.map((p) => (p.id === playerId ? { ...p, cardIds, isReady: false } : p)),
          }))
        }
        return success
      },
      [joinGame, playerId],
    ),

    leaveGame: useCallback(async () => {
      const success = leaveGame()
      if (success) {
        setGameState((prev) => ({
          ...prev,
          players: prev.players.filter((p) => p.id !== playerId),
        }))
      }
      return success
    }, [leaveGame, playerId]),

    markNumber: useCallback(
      async (cardId: string, number: number, position: { row: number; col: number }) => {
        return markNumber(cardId, number, position)
      },
      [markNumber],
    ),

    claimBingo: useCallback(
      async (cardId: string, pattern: string, winningNumbers: number[]) => {
        return claimBingo(cardId, pattern, winningNumbers)
      },
      [claimBingo],
    ),

    setReady: useCallback(
      async (isReady: boolean) => {
        const success = setReady(isReady)
        if (success) {
          setGameState((prev) => ({
            ...prev,
            players: prev.players.map((p) => (p.id === playerId ? { ...p, isReady } : p)),
          }))
        }
        return success
      },
      [setReady, playerId],
    ),
  }

  return {
    // Connection state
    connectionState,
    isConnected,
    isConnecting,

    // Game state
    gameState,

    // Connection actions
    connect,
    disconnect,
    reconnect,

    // Game actions
    ...gameActions,

    // Utility
    getCurrentPlayer: useCallback(
      () => gameState.players.find((p) => p.id === playerId),
      [gameState.players, playerId],
    ),

    getPlayerMarkedNumbers: useCallback(
      (cardId: string) => {
        const player = gameState.players.find((p) => p.id === playerId)
        return player?.markedNumbers[cardId] || []
      },
      [gameState.players, playerId],
    ),
  }
}
