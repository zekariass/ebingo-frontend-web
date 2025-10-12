import { create } from "zustand"
import type { Room } from "@/lib/types"
import i18n from "@/i18n"

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


// const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;  


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
    // if (get().rooms.length) return
    const urlPath = `/${i18n.language}/api/rooms`

    set({ loading: true, error: null })
    try {
      // const rooms = await apiClient.getRooms()

      const response = await fetch(`${urlPath}`);

      const { success, data, error } = await response.json();

      set({ rooms: data, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      })
    }
  },

  clearFilters: () => set({ filters: {} }),
}))
