// import { create } from "zustand"
// import { persist } from "zustand/middleware"
// import { GameStatus as Status } from "@/lib/types"
// import type { GameState, GameStatus, CardInfo, GameWinner, WSPayload } from "@/lib/types"
// import { add } from "date-fns"

// interface GameStore {
//   game : GameState
//   error: string | null

//   // Actions
//   setGameState: (game: Partial<GameState>) => void
//   resetGameState: () => void
//   getGameState: () => Promise<GameState | null>
//   addPlayer: (playerId: number) => void
//   removePlayer: (playerId: number) => void
//   setPlayersCount: (count: number) => void
//   addDrawnNumber: (number: number) => void
//   resetDrawnNumbers: () => void
//   setCurrentDrawnNumber: (number: number) => void
//   addDisqualifiedPlayer: (userId: number) => void
//   setAmIDisqualified: (disqualified: boolean) => void
//   addCard: (card: CardInfo) => void
//   selectCard: (cardId: string) => void
//   releaseCard: (cardId: string) => void
//   setAllPlayerSelectedCardIds: (cardIds: string[]) => void
//   setAllCardIds: (cardIds: string[]) => void
//   addMarkedNumberToCard: (cardId: string, number: number) => void
//   removeMarkedNumberFromCard: (cardId: string, number: number) => void
//   setWinner: (winner: GameWinner) => void
//   stopDrawing: () => void
//   setStarted: (started: boolean) => void
//   setEnded: (ended: boolean) => void
//   updateStatus: (status: GameStatus) => void
//   handleBingoClaimResponse: (payload: WSPayload) => void
//   setCountdown: (seconds: number) => void
//   setError: (error: string | null) => void

// }

// const initialGameState: GameState = {
//   gameId: 0,
//   roomId: 0,
//   joinedPlayers: [],
//   playersCount: 0,
//   drawnNumbers: [25, 67,  7, 55, 42, 5, 18, 48, 70, 10, 30, 60],
//   disqualifiedUsers: [],
//   amIDisqualified: false,
//   currentCardPool: [],
//   userSelectedCardsIds: [],
//   userSelectedCards: [],
//   allSelectedCardsIds: ['7c6f0469-8073-46cb-8aff-6617fa6ffbf5', '9b60e6f8-f3d2-4d8d-a864-80a095d7db47'],
//   allCardIds: [],
//   started: false,
//   ended: false,
//   status: Status.READY,
//   stopNumberDrawing: false,
//   winner: null,
//   countdown: 0,
// }

// export const useGameStore = create<GameStore>()(
//   persist(
//     (set, get) => ({
//       game: initialGameState,
//       error: null,

//       setGameState: (game) =>
//         set((state) => ({
//           game: { ...state.game, ...game },
//         })),

//       resetGameState: () => set({ game: { ...initialGameState } }),

//         getGameState: async () => {
//         try {
//           const response = await fetch(`/api/game/${get().game.roomId}/state`); 
//             if (!response.ok) {
//             throw new Error(`Error fetching game state: ${response.statusText}`);
//           }
//             const data = await response.json();
//             set({ game: data });
//             return data;
//         } catch (error) {
//           console.error("Failed to fetch game state:", error);
//           return null;
//         }
//         },

//       addPlayer: (playerId) =>
//         set((state) => {
//           if (state.game.joinedPlayers.includes(playerId)) return state
//           return {
//             game: {
//               ...state.game,
//               joinedPlayers: [...state.game.joinedPlayers, playerId],
//             },
//           }
//         }),

//       removePlayer: (playerId) =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             joinedPlayers: state.game.joinedPlayers.filter((id) => id !== playerId),
//           },
//         })),

//         setPlayersCount: (count) =>
//         set((state) => ({
//           game: {       
//             ...state.game,
//             playersCount: count,
//           },
//         })),

//       addDrawnNumber: (number) =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             drawnNumbers: [...state.game.drawnNumbers, number],
//           },
//         })),

//         setCurrentDrawnNumber: (number) =>  
//         set((state) => ({
//           game: {
//             ...state.game,
//             currentDrawnNumber: number,
//           },
//         })),

//         resetDrawnNumbers: () =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             drawnNumbers: [],
//           },
//         })),

//       addDisqualifiedPlayer: (userId) =>
//         set((state) => {
//           if (state.game.disqualifiedUsers.includes(userId)) return state
//           return {
//             game: {
//               ...state.game,
//               disqualifiedUsers: [...state.game.disqualifiedUsers, userId],
//             },
//           }
//         }),

//         setAmIDisqualified: (disqualified) =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             amIDisqualified: disqualified,
//           },
//         })),

//       addCard: (card) =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             currentCardPool: [...state.game.currentCardPool, card],
//           },
//         })),

//       selectCard: (cardId) =>
//         set((state) => {
//           if (state.game.userSelectedCardsIds.includes(cardId)) return state
//           return { game: {
//               ...state.game,
//               allSelectedCardsIds: [...state.game.allSelectedCardsIds, cardId],
//               userSelectedCardsIds: [...state.game.userSelectedCardsIds, cardId],
//                 userSelectedCards: state.game.currentCardPool.filter(card => state.game.userSelectedCardsIds.includes(card.cardId) || card.cardId === cardId)

//             },
//           }
//         }),
           

//       releaseCard: (cardId) =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             userSelectedCardsIds: state.game.userSelectedCardsIds?.filter((id) => id !== cardId),
//             userSelectedCards: state.game.userSelectedCards?.filter(card => card.cardId !== cardId) || [],
//             allSelectedCardsIds: state.game.allSelectedCardsIds?.filter((id) => id !== cardId),
//           },
//         })),


//         setAllPlayerSelectedCardIds: (cardIds) => 
//         set((state) => ({
//           game: {
//             ...state.game,
//             allSelectedCardsIds: cardIds,
//           },
//         })),


//         setAllCardIds: (cardIds) => 
//         set((state) => ({
//           game: {   
//             ...state.game,
//             allCardIds: cardIds,
//           },
//         })),

//         addMarkedNumberToCard: (cardId, number) =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             userSelectedCards: state.game.userSelectedCards?.map(card => {
//               if (card.cardId !== cardId) return card
//               if (card.markedNumbers.includes(number)) return card
//               return { ...card, markedNumbers: [...card.markedNumbers, number] }
//             }) || [],
//           },
//         })),

//         removeMarkedNumberFromCard: (cardId, number) =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             userSelectedCards: state.game.userSelectedCards?.map(card => {
//               if (card.cardId !== cardId) return card
//               return { ...card, markedNumbers: card.markedNumbers.filter(n => n !== number) }
//             }) || [],
//           },
//         })),

//       setWinner: (winner) =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             winner,
//             ended: true,
//             status: Status.COMPLETED,
//           },
//         })),

//         setStarted: (started) =>        
//         set((state) => ({
//             game: {
//             ...state.game,
//             started,
//             status: started ? Status.PLAYING : state.game.status,
//           },
//         })),

//         setEnded: (ended) =>
//         set((state) => ({
//           game: {
//             ...state.game,
//             ended,
//             status: ended ? Status.COMPLETED : state.game.status,
//           },
//         })),

//         handleBingoClaimResponse: (payload) => {
//          if (!payload.success && payload.reason) {
//             set((state) => ({
//               game: {
//                 ...state.game,
//                 disqualifiedUsers: [...state.game.disqualifiedUsers, payload.playerId],
//                 amIDisqualified: !payload.success,
//               },
//             })) 
//           // Handle unsuccessful claim (e.g., show notification)
//           console.warn("Bingo claim unsuccessful:", payload.reason)
//         }   
//         },

//         setCountdown: (seconds) =>
//         set((state) => ({
//             game: { 
//             ...state.game,
//             countdown: seconds,
//             status: seconds > 0 ? Status.COUNTDOWN : state.game.status,
//           },
//         })),

//         setError: (error) => set({ error }),

//       updateStatus: (status) =>
//         set((state) => ({
//           game: { ...state.game, status },
//         })),

//       stopDrawing: () =>
//         set((state) => ({
//           game: { ...state.game, stopNumberDrawing: true },
//         })),

       
//     }),
//     {
//       name: "bingo-game-storage",
//       partialize: (state) => ({
//         game: state.game,
//       }),
//     },
//   ),
// )



import { create } from "zustand"
import { persist } from "zustand/middleware"
import { GameStatus as Status } from "@/lib/types"
import type { GameState, GameStatus, CardInfo, GameWinner, WSPayload } from "@/lib/types"

interface GameStore {
  game: GameState
  error: string | null

  // Actions
  setGameState: (game: Partial<GameState>) => void
  resetGameState: () => void
  getGameState: () => Promise<GameState | null>
  addPlayer: (playerId: number) => void
  removePlayer: (playerId: number) => void
  setPlayersCount: (count: number) => void
  addDrawnNumber: (number: number) => void
  resetDrawnNumbers: () => void
  setCurrentDrawnNumber: (number: number) => void
  addDisqualifiedPlayer: (userId: number) => void
  setAmIDisqualified: (disqualified: boolean) => void
  addCard: (card: CardInfo) => void
  selectCard: (cardId: string) => void
  releaseCard: (cardId: string) => void
  setAllPlayerSelectedCardIds: (cardIds: string[]) => void
  setAllCardIds: (cardIds: string[]) => void
  addMarkedNumberToCard: (cardId: string, number: number) => void
  computePlayerCardsFromPlayerCardsIds: () => void,
  getCurrentCardById: (cardId: string) => CardInfo | null
  removeMarkedNumberFromCard: (cardId: string, number: number) => void
  setWinner: (winner: GameWinner) => void
  stopDrawing: () => void
  // joinGame: () => void,
  setStarted: (started: boolean) => void
  setEnded: (ended: boolean) => void
  updateStatus: (status: GameStatus) => void
  handleBingoClaimResponse: (payload: WSPayload) => void
  setCountdown: (seconds: number) => void
  setError: (error: string | null) => void
}

const initialGameState: GameState = {
  gameId: 0,
  roomId: 0,
  joinedPlayers: [],
  playersCount: 0,
  drawnNumbers: [],
  disqualifiedUsers: [],
  amIDisqualified: false,
  currentCardPool: [],
  userSelectedCardsIds: [],
  userSelectedCards: [],
  allSelectedCardsIds: [],
  allCardIds: [],
  started: false,
  ended: false,
  status: Status.READY,
  stopNumberDrawing: false,
  winner: null,
  countdown: 0,
}

const maxCards = 2

export const useGameStore = create<GameStore>()(
  // persist(
    (set, get) => ({
      game: initialGameState,
      error: null,

      setGameState: (game) =>
        set((state) => ({ game: { ...state.game, ...game } })),

      resetGameState: () => set({ game: { ...initialGameState } }),

      getGameState: async () => {
        try {
          const response = await fetch(`/api/game/${get().game.roomId}/state`)
          if (!response.ok) {
            throw new Error(`Error fetching game state: ${response.statusText}`)
          }
          const data = await response.json()
          set({ game: data })
          return data
        } catch (error) {
          console.error("Failed to fetch game state:", error)
          return null
        }
      },

      computePlayerCardsFromPlayerCardsIds: () =>
        set((state) => {
          const { currentCardPool, userSelectedCardsIds } = state.game;

          return {
            game: {
              ...state.game,
              userSelectedCards: currentCardPool.filter(card =>
                userSelectedCardsIds.includes(card.cardId)
              ),
            },
          };
        }),


      addPlayer: (playerId) =>
        set((state) => {
          if (state.game.joinedPlayers.includes(playerId)) return state
          return {
            game: {
              ...state.game,
              joinedPlayers: [...state.game.joinedPlayers, playerId],
            },
          }
        }),

      removePlayer: (playerId) =>
        set((state) => ({
          game: {
            ...state.game,
            joinedPlayers: state.game.joinedPlayers.filter((id) => id !== playerId),
          },
        })),

      setPlayersCount: (count) =>
        set((state) => ({
          game: { ...state.game, playersCount: count },
        })),

      addDrawnNumber: (number) =>
        set((state) => ({
          game: {
            ...state.game,
            drawnNumbers: [...state.game.drawnNumbers, number],
          },
        })),

      setCurrentDrawnNumber: (number) =>
        set((state) => ({
          game: { ...state.game, currentDrawnNumber: number },
        })),

      resetDrawnNumbers: () =>
        set((state) => ({
          game: { ...state.game, drawnNumbers: [] },
        })),

      addDisqualifiedPlayer: (userId) =>
        set((state) => {
          if (state.game.disqualifiedUsers.includes(userId)) return state
          return {
            game: {
              ...state.game,
              disqualifiedUsers: [...state.game.disqualifiedUsers, userId],
            },
          }
        }),

      setAmIDisqualified: (disqualified) =>
        set((state) => ({
          game: { ...state.game, amIDisqualified: disqualified },
        })),

      addCard: (card) =>
        set((state) => ({
          game: {
            ...state.game,
            currentCardPool: [...state.game.currentCardPool, card],
          },
        })),

      selectCard: (cardId) =>
        set((state) => {
          const { game } = state
          if (game.userSelectedCardsIds.includes(cardId)) return state
          if (game.userSelectedCardsIds.length >= maxCards) return state

          const newUserSelectedIds = Array.from(
            new Set([...game.userSelectedCardsIds, cardId]),
          )
          const newAllSelectedIds = Array.from(
            new Set([...game.allSelectedCardsIds, cardId]),
          )
          const newUserSelectedCards = game.currentCardPool.filter((card) =>
            newUserSelectedIds.includes(card.cardId),
          )

          return {
            game: {
              ...game,
              userSelectedCardsIds: newUserSelectedIds,
              allSelectedCardsIds: newAllSelectedIds,
              userSelectedCards: newUserSelectedCards,
            },
          }
        }),

      releaseCard: (cardId) =>
        set((state) => {
          
          const { game } = state
          const newUserSelectedIds = game.userSelectedCardsIds.filter(
            (id) => id !== cardId,
          )
          const newAllSelectedIds = game.allSelectedCardsIds.filter(
            (id) => id !== cardId,
          )
          const newUserSelectedCards = game.userSelectedCards.filter(
            (card) => card.cardId !== cardId,
          )

          return {
            game: {
              ...game,
              userSelectedCardsIds: newUserSelectedIds,
              allSelectedCardsIds: newAllSelectedIds,
              userSelectedCards: newUserSelectedCards,
            },
          }
        }),

      setAllPlayerSelectedCardIds: (cardIds) =>
        set((state) => ({
          game: { ...state.game, allSelectedCardsIds: [...new Set(cardIds)] },
        })),

      setAllCardIds: (cardIds) =>
        set((state) => ({
          game: { ...state.game, allCardIds: [...new Set(cardIds)] },
        })),

      addMarkedNumberToCard: (cardId, number) =>
        set((state) => ({
          game: {
            ...state.game,
            userSelectedCards:
              state.game.userSelectedCards?.map((card) => {
                if (card.cardId !== cardId) return card
                if (card.markedNumbers.includes(number)) return card
                return { ...card, markedNumbers: [...card.markedNumbers, number] }
              }) || [],
          },
        })),

      removeMarkedNumberFromCard: (cardId, number) =>
        set((state) => ({
          game: {
            ...state.game,
            userSelectedCards:
              state.game.userSelectedCards?.map((card) => {
                if (card.cardId !== cardId) return card
                return {
                  ...card,
                  markedNumbers: card.markedNumbers.filter((n) => n !== number),
                }
              }) || [],
          },
        })),

      getCurrentCardById: (cardId: string) => {
        const { game } = get()
        const card = game.userSelectedCards?.find((c) => c.cardId === cardId) || null
        return card
      },

      setWinner: (winner) =>
        set((state) => ({
          game: {
            ...state.game,
            winner,
            ended: true,
            status: Status.COMPLETED,
          },
        })),

      setStarted: (started) =>
        set((state) => ({
          game: {
            ...state.game,
            started,
            status: started ? Status.PLAYING : state.game.status,
          },
        })),

      setEnded: (ended) =>
        set((state) => ({
          game: {
            ...state.game,
            ended,
            status: ended ? Status.COMPLETED : state.game.status,
          },
        })),

      handleBingoClaimResponse: (payload) => {
        if (!payload.success && payload.reason) {
          set((state) => ({
            game: {
              ...state.game,
              disqualifiedUsers: [
                ...state.game.disqualifiedUsers,
                payload.playerId,
              ],
              amIDisqualified: true,
            },
          }))
          console.warn("Bingo claim unsuccessful:", payload.reason)
        }
      },

      setCountdown: (seconds) =>
        set((state) => ({
          game: {
            ...state.game,
            countdown: seconds,
            status: seconds > 0 ? Status.COUNTDOWN : state.game.status,
          },
        })),

      setError: (error) => set({ error }),

      updateStatus: (status) =>
        set((state) => ({
          game: { ...state.game, status },
        })),

      stopDrawing: () =>
        set((state) => ({
          game: { ...state.game, stopNumberDrawing: true },
        })),
    }),
    // {
    //   name: "bingo-game-storage",
    //   partialize: (state) => ({ game: state.game }),
    // },
  )
// )
