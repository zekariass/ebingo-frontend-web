import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ApiResponse, PaymentMethod, Transaction, WalletBalance } from "@/lib/types"
import i18n from "@/i18n"

interface PaymentState {
  balance: WalletBalance
  paymentMethods: PaymentMethod[]
  transactions: Transaction[]
  loading: boolean
  error: string | null

  // Actions
  resetBalance: () => void
  resetPaymentMethods: () => void
  resetTransactions: () => void
  reset: () => void
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

  // From DB
  fetchWallet: () => Promise<void>
  fetchPaymentMethods: () => Promise<void>
  fetchTransactions: (page: number, size: number) => Promise<void>
}

export const usePaymentStore = create<PaymentState>()(
  // persist(
    (set, get) => ({
      balance: {
        id: 0,
        userProfileId: 0,
        totalDeposit: 0,
        depositBalance: 0, 
        pendingBalance: 0,
        welcomeBonus: 0,
        availableWelcomeBonus: 0,
        referralBonus: 0,
        availableReferralBonus: 0,
        totalPrizeAmount: 0,
        pendingWithdrawal: 0,
        totalWithdrawal: 0,
        totalAvailableBalance: 0,
        availableToWithdraw: 0,
      },
      paymentMethods: [],
      transactions: [],
      loading: false,
      error: null,

      // Actions
      resetBalance: () => set({ balance: {
        id: 0,
        userProfileId: 0,
        totalDeposit: 0,
        depositBalance: 0, 
        pendingBalance: 0,
        welcomeBonus: 0,
        availableWelcomeBonus: 0,
        referralBonus: 0,
        availableReferralBonus: 0,
        totalPrizeAmount: 0,
        pendingWithdrawal: 0,
        totalWithdrawal: 0,
        totalAvailableBalance: 0,
        availableToWithdraw: 0,
      } }),
      resetPaymentMethods: () => set({ paymentMethods: [] }),
      resetTransactions: () => set({ transactions: [] }),
      reset: () => set({
        balance: {
          id: 0,
          userProfileId: 0,
          totalDeposit: 0,
          depositBalance: 0, 
          pendingBalance: 0,
          welcomeBonus: 0,
          availableWelcomeBonus: 0,
          referralBonus: 0,
          availableReferralBonus: 0,
          totalPrizeAmount: 0,
          pendingWithdrawal: 0,
          totalWithdrawal: 0,
          totalAvailableBalance: 0,
          availableToWithdraw: 0,
        },
        paymentMethods: [],
        transactions: [],
        loading: false,
        error: null,
      }),

      setBalance: (balance) => set({ balance }),

      setPaymentMethods: (paymentMethods) => set({ paymentMethods }),

      addPaymentMethod: (method) =>
        set((state) => ({
          paymentMethods: [...state.paymentMethods, method],
        })),

    
      removePaymentMethod: (methodId) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.filter((m) => m.id !== Number(methodId)),
        })),


      setDefaultPaymentMethod: (methodId) => {
        set((state) => ({
          paymentMethods: state.paymentMethods.map((m) => ({
            ...m,
            isDefault: m.id === Number(methodId),
          })),
        }))
      },

      setTransactions: (transactions) => set({ transactions }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),


      updateTransaction: (transactionId, updates) =>    
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === Number(transactionId) ? { ...t, ...updates } : t
          ),
        })),  

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Computed getters
      getDefaultPaymentMethod: () => {
        const { paymentMethods } = get()
        return paymentMethods?.find((m) => m.isDefault) || null// || paymentMethods[0] || null
      },


      getPendingTransactions: () => {
        const { transactions } = get()
        return transactions.filter((t) => t.status === 'PENDING' || t.status === 'AWAITING_APPROVAL')
      },


      getRecentTransactions: (limit = 10) => {
        const { transactions } = get()
        return transactions
          .sort((a, b) => b.id - a.id)
          .slice(0, limit)
      },


      // Async actions to fetch from DB
      fetchWallet: async () => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${i18n.language}/api/payments/wallet`)
          if (!response.ok) throw new Error("Failed to fetch wallet")
          const result = await response.json()
          const {data} = result

          if(data) {
            set({ balance: data, loading: false })
          }else{
            throw new Error("No wallet data found")
          }


        } catch (error: any) {
          set({ error: error.message || "Error fetching wallet", loading: false })
        }
      },


      fetchPaymentMethods: async () => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${i18n.language}/api/payments/methods`)
          if (!response.ok) throw new Error("Failed to fetch payment methods")
          const result = await response.json()
          const {data} = result
          set({ paymentMethods: data, loading: false })
        } catch (error: any) {
          set({ error: error.message || "Error fetching payment methods", loading: false })
        }
      },


      fetchTransactions: async (page, number) => {
      set({ loading: true, error: null });
      try {
        // Build URL with query parameters
        const url = new URL(`${i18n.language}/api/payments/transactions`, window.location.origin);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('size', number.toString());

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Failed to fetch transactions");

        const result = await response.json();
        const { data } = result;

        console.log("===================TXN=========>>> Fetched Transactions:", data);


        set({ transactions: data, loading: false });
      } catch (error: any) {
        set({ error: error.message || "Error fetching transactions", loading: false });
      }
    },

    }),
    // {
    //   name: "bingo-payment-storage",
    //   partialize: (state) => ({
    //     balance: state.balance,
    //     paymentMethods: state.paymentMethods,
    //     transactions: state.transactions.slice(0, 50), // Keep only recent transactions
    //   }),
    // },
  )
// )
