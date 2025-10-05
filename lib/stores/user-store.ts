import i18n from "@/i18n"
import { UserProfile } from "../types"
import { create } from "zustand"

export interface UserState {
    user: UserProfile | null
    loading?: boolean
    error?: string | null
    setUser: (user: UserProfile | null) => void
    resetUser: () => void
    fetchUserProfile: () => Promise<UserProfile | null>
    setLoading?: (loading: boolean) => void
    setError?: (error: string | null) => void
 }

export const userStore = create<UserState>()(
    (set, get) => ({
    user: null,
    setUser: (user) => set({ user }),
    resetUser: () => set({ user: null }),
    fetchUserProfile: async () => {
        // If user is already set, return without fetching from db
        if (get().user) return get().user
        try {

            set({ loading: true, error: null });
            const response = await fetch(`/${i18n.language}/api/auth/me`);
            if (!response.ok) {
                set({ loading: false, error: 'Failed to fetch user profile' });
                throw new Error('Failed to fetch user profile');
            }
            const result = await response.json();
            const { data } = result;
            set({ loading: false });
            set({ user: data });
            return data;
        }
        catch (error) {
            set({ loading: false, error: error instanceof Error ? error.message : 'Unknown error' });
            console.error('Error fetching user profile:', error);
            return null;
        }
    },
}));