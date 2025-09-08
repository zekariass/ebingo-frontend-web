import { create } from "zustand"
import type { Room } from "@/lib/types"
import { apiClient } from "@/lib/api/client"

interface LobbyState {
  rooms: Room[]
  loading: boolean
  error: string | null
  filters: {
    fee?: number
    status?: Room["status"]
    search?: string
  }

  // Actions
  setRooms: (rooms: Room[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<LobbyState["filters"]>) => void
  fetchRooms: () => Promise<void>
  clearFilters: () => void
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  rooms: [],
  loading: false,
  error: null,
  filters: {},

  setRooms: (rooms) => set({ rooms }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  fetchRooms: async () => {
    set({ loading: true, error: null })
    try {
      const rooms = await apiClient.getRooms()
      set({ rooms, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      })
    }
  },

  clearFilters: () => set({ filters: {} }),
}))
