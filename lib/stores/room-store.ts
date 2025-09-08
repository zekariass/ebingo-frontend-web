import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Room, BingoCard, GameState, BingoPattern } from "@/lib/types"
import { generateBingoCard } from "@/lib/utils/bingo"

interface RoomState {
  // Room data
  room: Room | null
  game: GameState | null
  players: number

  // User state
  selectedCardIds: number[]
  userCards: BingoCard[]
  balance: number

  // Game state
  calledNumbers: number[]
  currentNumber: number | null
  pattern: BingoPattern | null

  // UI state
  connected: boolean
  latencyMs: number
  serverTimeOffset: number

  // Actions
  setRoom: (room: Room) => void
  setGame: (game: GameState | null) => void
  setPlayers: (count: number) => void
  selectCard: (cardId: number) => void
  deselectCard: (cardId: number) => void
  setUserCards: (cards: BingoCard[]) => void
  markNumber: (cardId: number, number: number) => void
  setCalledNumbers: (numbers: number[]) => void
  setCurrentNumber: (number: number | null) => void
  setPattern: (pattern: BingoPattern | null) => void
  setConnected: (connected: boolean) => void
  setLatency: (ms: number) => void
  setServerTimeOffset: (offset: number) => void
  setBalance: (balance: number) => void
  initializeRoom: (roomId: string) => void
  resetRoom: () => void
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      // Initial state
      room: null,
      game: null,
      players: 0,
      selectedCardIds: [],
      userCards: [],
      balance: 0,
      calledNumbers: [],
      currentNumber: null,
      pattern: null,
      connected: false,
      latencyMs: 0,
      serverTimeOffset: 0,

      // Actions
      setRoom: (room) => set({ room }),
      setGame: (game) => set({ game }),
      setPlayers: (players) => set({ players }),

      selectCard: (cardId) =>
        set((state) => {
          const room = state.room
          const maxCards = room?.fee === 10 ? 200 : 2

          if (state.selectedCardIds.length >= maxCards) return state
          if (state.selectedCardIds.includes(cardId)) return state

          const newCard = generateBingoCard(cardId)
          const updatedSelectedCardIds = [...state.selectedCardIds, cardId]
          const updatedUserCards = [...state.userCards, newCard]

          console.log("[v0] Generated card:", newCard)

          return {
            selectedCardIds: updatedSelectedCardIds,
            userCards: updatedUserCards,
          }
        }),

      deselectCard: (cardId) =>
        set((state) => {
          const updatedSelectedCardIds = state.selectedCardIds.filter((id) => id !== cardId)
          const updatedUserCards = state.userCards.filter((card) => card.id !== cardId)

          return {
            selectedCardIds: updatedSelectedCardIds,
            userCards: updatedUserCards,
          }
        }),

      setUserCards: (userCards) => set({ userCards }),

      markNumber: (cardId, number) =>
        set((state) => {
          // Only allow marking if number has been called
          if (!state.calledNumbers.includes(number)) return state

          const updatedCards = state.userCards.map((card) => {
            if (card.id !== cardId) return card

            const newMarked = card.marked.map((row, rowIndex) =>
              row.map((marked, colIndex) => {
                if (card.numbers[rowIndex][colIndex] === number) {
                  return true
                }
                return marked
              }),
            )

            console.log("[v0] Updated card marked state:", { cardId, number, newMarked })

            return { ...card, marked: newMarked }
          })

          return { userCards: updatedCards }
        }),

      setCalledNumbers: (calledNumbers) => set({ calledNumbers }),
      setCurrentNumber: (currentNumber) => set({ currentNumber }),
      setPattern: (pattern) => set({ pattern }),
      setConnected: (connected) => set({ connected }),
      setLatency: (latencyMs) => set({ latencyMs }),
      setServerTimeOffset: (serverTimeOffset) => set({ serverTimeOffset }),
      setBalance: (balance) => set({ balance }),

      initializeRoom: (roomId) => {
        set({
          selectedCardIds: [],
          userCards: [],
          calledNumbers: [],
          currentNumber: null,
          pattern: null,
        })

        if (roomId === "test-room-1") {
          set({
            room: {
              id: roomId,
              name: "$10 Test Room (Auto-Play)",
              fee: 10,
              players: 15,
              capacity: 100,
              status: "in-game",
            },
            balance: 100, // Give test balance
          })
        }
      },

      resetRoom: () =>
        set({
          room: null,
          game: null,
          players: 0,
          selectedCardIds: [],
          userCards: [], // Also reset userCards when resetting room
          calledNumbers: [],
          currentNumber: null,
          pattern: null,
          connected: false,
          latencyMs: 0,
          serverTimeOffset: 0,
        }),
    }),
    {
      name: "bingo-room-storage",
      partialize: (state) => ({
        balance: state.balance,
        selectedCardIds: state.selectedCardIds,
        userCards: state.userCards,
      }),
    },
  ),
)
