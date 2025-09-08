export interface PaymentMethod {
  id: string
  type: "credit_card" | "debit_card" | "paypal" | "bank_account" | "crypto"
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  nickname?: string
}

export interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "game_entry" | "prize_payout" | "refund"
  amount: number
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  description: string
  createdAt: string
  completedAt?: string
  paymentMethodId?: string
  gameId?: string
  roomId?: string
  metadata?: Record<string, any>
}

export interface WalletBalance {
  available: number
  pending: number
  total: number
  currency: string
}

export interface DepositRequest {
  amount: number
  paymentMethodId: string
}

export interface WithdrawalRequest {
  amount: number
  paymentMethodId: string
}

export interface PaymentProcessingResult {
  success: boolean
  transactionId?: string
  error?: string
  requiresVerification?: boolean
}
