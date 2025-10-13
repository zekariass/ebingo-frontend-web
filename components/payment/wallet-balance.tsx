"use client"

import { useCallback, useEffect, useMemo } from "react"
import { usePaymentStore } from "@/lib/stores/payment-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wallet, Plus, Minus, RefreshCw, MoveRight } from "lucide-react"
import { DepositDialog } from "./deposit-dialog"
import { WithdrawDialog } from "./withdraw-dialog"
import { useState } from "react"
import { currency } from "@/lib/constant"
import { TransferDialog } from "./transfer-dialog"

export function WalletBalance() {
  const { balance, transactions, loading, setLoading, error, setError, fetchWallet, getPendingTransactions } = usePaymentStore()
  // const { setBalance: setRoomBalance } = useRoomStore()
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)

  const refreshBalance = useCallback(async (refresh: boolean)=>{
      setLoading(true)
      setError(null)

      try {
        await fetchWallet(refresh)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to refresh balance")
      } finally {
        setLoading(false)
      }
    
  }, [fetchWallet, setLoading, setError])


  const computePendingTxns = getPendingTransactions()


  const getPendingDepositBalance = useCallback(() => {
      let pendingDepBal = 0.0;
      const txns = Array.isArray(transactions) ? transactions : [];

      txns?.forEach(txn => {
        if (
          txn.txnType === "DEPOSIT" &&
          (txn.status === "PENDING" || txn.status === "AWAITING_APPROVAL")
        ) {
          pendingDepBal += txn.txnAmount;
        }
      });

      return pendingDepBal;
    }, [transactions]);


  useEffect(() => {
     refreshBalance(true)
  }, [])

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Balance
            </CardTitle>
            <Button variant="outline" size="sm" onClick={()=>refreshBalance(true)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currency} {balance.totalAvailableBalance?.toFixed(2)}
              </span>
            </div>

            {balance.pendingWithdrawal > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Withdrawal</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Processing
                    </Badge>
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      {currency} {balance.pendingWithdrawal?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {computePendingTxns.length > 0 && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Deposit</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Processing
                    </Badge>
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      {currency} {getPendingDepositBalance()?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Balance</span>
              <span className="text-lg font-semibold">{currency} {balance.totalAvailableBalance?.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Button onClick={() => setDepositOpen(true)} className="flex items-center gap-2 dark:bg-green-500">
              {/* <Plus className="h-4 w-4" /> */}
              Deposit
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setTransferOpen(true)}
              disabled={balance.totalAvailableBalance <= 0}
              className="flex items-center gap-2 dark:bg-yellow-500"
            >
              {/* <MoveRight className="h-4 w-4"/> */}
              Transfer
            </Button>

            <Button
              variant="outline"
              onClick={() => setWithdrawOpen(true)}
              disabled={balance.totalAvailableBalance <= 0}
              className="flex items-center gap-2 dark:bg-red-500"
            >
              {/* <Minus className="h-4 w-4" /> */}
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} />
    </>
  )
}
