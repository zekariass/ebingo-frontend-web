import { create } from "zustand"
import { RoomFormData } from "../schemas/admin-schemas"
import { log } from "console"
import i18n from "@/i18n"

interface AdminStats {
  activePlayers: number
  playersToday: number
  revenueToday: number
  revenueGrowth: number
  activeGames: number
  gamesCompleted: number
  avgGameDuration: number
}

interface ActiveRoom {
  id: string
  name: string
  players: number
  capacity: number
  fee: number
  status: "active" | "waiting" | "finished"
  gameStatus: "waiting" | "playing" | "finished"
}

interface Transaction {
  id: string
  playerName: string
  type: string
  amount: number
  status: "completed" | "pending" | "failed"
  timestamp: string
}

// interface Room {
//   id: string
//   name: string
//   fee: number
//   capacity: number
//   players: number
//   minPlayers: number,
//   status: "OPEN" | "GAME_READY" | "GAME_STARTED" | "CLOSED"
//   gameStatus: "waiting" | "playing" | "finished"
//   pattern: string
// }

export type Room = {
  id: number;                  // Long -> number
  name: string;
  capacity: number;             // Integer -> number
  minPlayers: number;           // Integer -> number
  entryFee: number;             // BigDecimal -> number
  pattern: "LINE" | "LINE_AND_CORNERS" | "CORNERS" | "FULL_HOUSE"; // match RoomPattern enum
  status: "OPEN" | "GAME_READY" | "GAME_STARTED" | "CLOSED";     // match RoomStatus enum
  createdBy: number;            // Long -> number
  createdAt: string;            // LocalDateTime -> ISO string
  updatedAt: string;            // LocalDateTime -> ISO string
};


interface Game {
  id: string
  roomName: string
  status: "waiting" | "playing" | "finished"
  numbersCalledCount: number
}

interface Player {
  id: string
  name: string
  email: string
  status: "active" | "banned"
  balance: number
  gamesPlayed: number
  winRate: number
}

interface Analytics {
  totalRevenue: number
  revenueGrowth: number
  totalPlayers: number
  playerGrowth: number
  gamesPlayed: number
  gamesDecline: number
  avgPrizePool: number
  prizePoolGrowth: number
  revenueByTier: Array<{
    fee: number
    games: number
    revenue: number
    percentage: number
  }>
  popularPatterns: Array<{
    name: string
    games: number
    percentage: number
  }>
}

interface AdminStore {
  // Dashboard data
  stats: AdminStats
  activeRooms: ActiveRoom[]
  recentTransactions: Transaction[]
  systemStatus: "healthy" | "warning" | "error"
  notifications: number

  // Room management
  rooms: Room[]

  // Game control
  activeGames: Game[]

  // Player management
  players: Player[]

  // Analytics
  analytics: Analytics

  // Loading states
  isLoading: boolean
  error: string | null

  // Actions
  loadDashboardData: () => Promise<void>
  refreshData: () => Promise<void>
  createRoom: (room: RoomFormData) => Promise<void>
  updateRoom: (id: string, updates: Partial<Room>) => Promise<void>
  deleteRoom: (id: number) => Promise<void>
  // retrieveRooms: () => Promise<Room[]>
  controlGame: (gameId: string, action: string, data?: any) => Promise<void>
  banPlayer: (playerId: string) => Promise<void>
  unbanPlayer: (playerId: string) => Promise<void>
  loadRooms: () => Promise<void>
  loadPlayers: (search?: string) => Promise<void>
  loadGames: () => Promise<void>
  loadAnalytics: () => Promise<void>
  
}

export const useAdminStore = create<AdminStore>((set, get) => ({


  // Initial state
  stats: {
    activePlayers: 247,
    playersToday: 89,
    revenueToday: 12450,
    revenueGrowth: 15.2,
    activeGames: 12,
    gamesCompleted: 156,
    avgGameDuration: 18,
  },

  activeRooms: [
    {
      id: "room-1",
      name: "$10 Quick Play",
      players: 45,
      capacity: 100,
      fee: 10,
      status: "active",
      gameStatus: "playing",
    },
    {
      id: "room-2",
      name: "$50 High Stakes",
      players: 78,
      capacity: 100,
      fee: 50,
      status: "active",
      gameStatus: "waiting",
    },
  ],

  recentTransactions: [
    {
      id: "tx-1",
      playerName: "John Doe",
      type: "Game Entry",
      amount: -10,
      status: "completed",
      timestamp: "2 min ago",
    },
    {
      id: "tx-2",
      playerName: "Jane Smith",
      type: "Prize Payout",
      amount: 250,
      status: "completed",
      timestamp: "5 min ago",
    },
  ],

  systemStatus: "healthy",
  notifications: 3,
  rooms: [],
  // [
  //   {
  //     id: "room-1",
  //     name: "$10 Quick Play",
  //     fee: 10,
  //     capacity: 100,
  //     players: 45,
  //     status: "active",
  //     gameStatus: "playing",
  //     pattern: "line",
  //   },
  //   {
  //     id: "room-2",
  //     name: "$50 High Stakes",
  //     fee: 50,
  //     capacity: 100,
  //     players: 78,
  //     status: "active",
  //     gameStatus: "waiting",
  //     pattern: "full-house",
  //   },
  // ],
  activeGames: [
    {
      id: "game-1",
      roomName: "$10 Quick Play",
      status: "playing",
      numbersCalledCount: 23,
    },
    {
      id: "game-2",
      roomName: "$20 Standard",
      status: "waiting",
      numbersCalledCount: 0,
    },
  ],
  players: [
    {
      id: "player-1",
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      balance: 150.5,
      gamesPlayed: 45,
      winRate: 12.5,
    },
    {
      id: "player-2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: "active",
      balance: 89.25,
      gamesPlayed: 32,
      winRate: 18.7,
    },
  ],
  analytics: {
    totalRevenue: 125450,
    revenueGrowth: 15.2,
    totalPlayers: 2847,
    playerGrowth: 8.5,
    gamesPlayed: 1256,
    gamesDecline: 2.1,
    avgPrizePool: 450,
    prizePoolGrowth: 12.3,
    revenueByTier: [
      { fee: 10, games: 450, revenue: 4500, percentage: 35 },
      { fee: 20, games: 320, revenue: 6400, percentage: 28 },
      { fee: 50, games: 180, revenue: 9000, percentage: 25 },
      { fee: 100, games: 85, revenue: 8500, percentage: 12 },
    ],
    popularPatterns: [
      { name: "Line", games: 456, percentage: 45 },
      { name: "Full House", games: 234, percentage: 23 },
      { name: "Four Corners", games: 178, percentage: 18 },
      { name: "X Pattern", games: 145, percentage: 14 },
    ],
  },

  // Loading states
  isLoading: false,
  error: null,

  // Actions
  loadDashboardData: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/admin/stats")
      const result = await response.json()

      if (result.success) {
        set({ stats: result.data })
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to load dashboard data" })
    } finally {
      set({ isLoading: false })
    }
  },

  refreshData: async () => {
    const { loadDashboardData, loadRooms, loadPlayers, loadGames } = get()
    await Promise.all([loadDashboardData(), loadRooms(), loadPlayers(), loadGames()])
  },

  createRoom: async (roomData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(roomData),
      })

      const result = await response.json()

      if (result.success) {
        const { loadRooms } = get()
        await loadRooms()
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to create room" })
    } finally {
      set({ isLoading: false })
    }
  },

  updateRoom: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/admin/rooms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (result.success) {
        const { loadRooms } = get()
        await loadRooms()
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to update room" })
    } finally {
      set({ isLoading: false })
    }
  },

  deleteRoom: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/admin/rooms/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        const { loadRooms } = get()
        await loadRooms()
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to delete room" })
    } finally {
      set({ isLoading: false })
    }
  },

  controlGame: async (gameId, action, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/admin/games/${gameId}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      })

      const result = await response.json()

      if (result.success) {
        const { loadGames } = get()
        await loadGames()
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to control game" })
    } finally {
      set({ isLoading: false })
    }
  },

  banPlayer: async (playerId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/admin/players/${playerId}/ban`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        const { loadPlayers } = get()
        await loadPlayers()
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to ban player" })
    } finally {
      set({ isLoading: false })
    }
  },

  unbanPlayer: async (playerId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/admin/players/${playerId}/unban`, {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        const { loadPlayers } = get()
        await loadPlayers()
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to unban player" })
    } finally {
      set({ isLoading: false })
    }
  },

  loadRooms: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/${i18n.language}/api/admin/rooms`)
      const result = await response.json()

      if (result.success) {
        // console.log("===================>: "+ JSON.stringify(result))
        set({ rooms: result.data })
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to load rooms" })
    } finally {
      set({ isLoading: false })
    }
  },

  loadPlayers: async (search) => {
    set({ isLoading: true, error: null })
    try {
      const url = search ? `/api/admin/players?search=${encodeURIComponent(search)}` : "/api/admin/players"
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        set({ players: result.data })
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to load players" })
    } finally {
      set({ isLoading: false })
    }
  },

  loadGames: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/admin/games")
      const result = await response.json()

      if (result.success) {
        set({ activeGames: result.data })
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to load games" })
    } finally {
      set({ isLoading: false })
    }
  },

  loadAnalytics: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/admin/analytics")
      const result = await response.json()

      if (result.success) {
        set({ analytics: result.data })
      } else {
        set({ error: result.error })
      }
    } catch (error) {
      set({ error: "Failed to load analytics" })
    } finally {
      set({ isLoading: false })
    }
  },
}))
