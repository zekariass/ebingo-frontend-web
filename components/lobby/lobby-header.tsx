"use client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { WalletBalance } from "@/components/payment/wallet-balance"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { TransactionHistory } from "@/components/payment/transaction-history"
import { History, Settings, Wallet } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useSession } from "@/hooks/use-session"
import HeaderUserDropdown from "./header-user-dropdown"
import LoginButton from "../auth/login-button"
import SignupButton from "../auth/signup-button"

export function LobbyHeader() {
  const [walletOpen, setWalletOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const {user, loading} = useSession();

  return (
    <>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-primary">
                Bingo Pro
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {!user && 
              <>
              <LoginButton />
              <SignupButton />
              </>
              }
              {user && 
              <>
              
              <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Wallet className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Wallet</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <WalletBalance />
                </DialogContent>
              </Dialog>

              <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">History</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <TransactionHistory />
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/rooms">
                  <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
              <HeaderUserDropdown />
              <ModeToggle />
              </>}
            </div>

          </div>
        </div>
      </header>
    </>
  )
}
