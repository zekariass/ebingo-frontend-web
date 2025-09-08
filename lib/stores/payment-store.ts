import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PaymentMethod, Transaction, WalletBalance } from "@/lib/types/payment"

interface PaymentState {
  balance: WalletBalance
  paymentMethods: PaymentMethod[]
  transactions: Transaction[]
  loading: boolean
  error: string | null

  // Actions
  setBalance: (balance: WalletBalance) => void
  setPaymentMethods: (methods: PaymentMethod[]) => void
  addPaymentMethod: (method: PaymentMethod) => void
  removePaymentMethod: (methodId: string) => void
  setDefaultPaymentMethod: (methodId: string) => void
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (transactionId: string, updates: Partial<Transaction>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed
  getDefaultPaymentMethod: () => PaymentMethod | null
  getPendingTransactions: () => Transaction[]
  getRecentTransactions: (limit?: number) => Transaction[]
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      balance: {
        available: 100.0, // Mock starting balance
        pending: 0,
        total: 100.0,
        currency: "USD",
      },
      paymentMethods: [],
      transactions: [],
      loading: false,
      error: null,

      setBalance: (balance) => set({ balance }),

      setPaymentMethods: (paymentMethods) => set({ paymentMethods }),

      addPaymentMethod: (method) =>
        set((state) => ({
          paymentMethods: [...state.paymentMethods, method],
        })),

      removePaymentMethod: (methodId) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.filter((m) => m.id !== methodId),
        })),

      setDefaultPaymentMethod: (methodId) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.map((m) => ({
            ...m,
            isDefault: m.id === methodId,
          })),
        })),

      setTransactions: (transactions) => set({ transactions }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),

      updateTransaction: (transactionId, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === transactionId ? { ...t, ...updates } : t)),
        })),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Computed getters
      getDefaultPaymentMethod: () => {
        const { paymentMethods } = get()
        return paymentMethods.find((m) => m.isDefault) || paymentMethods[0] || null
      },

      getPendingTransactions: () => {
        const { transactions } = get()
        return transactions.filter((t) => t.status === "pending" || t.status === "processing")
      },

      getRecentTransactions: (limit = 10) => {
        const { transactions } = get()
        return transactions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      },
    }),
    {
      name: "bingo-payment-storage",
      partialize: (state) => ({
        balance: state.balance,
        paymentMethods: state.paymentMethods,
        transactions: state.transactions.slice(0, 50), // Keep only recent transactions
      }),
    },
  ),
)
