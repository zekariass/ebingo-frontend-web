"use client"

import type { GameWinner } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, DollarSign, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface WinnerBannerProps {
  winner: GameWinner | null
}

export function WinnerBanner({ winner }: WinnerBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible || !winner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50"
      >
        <Card className="border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Trophy icon */}
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full">
                  <Trophy className="h-6 w-6 text-white" />
                </div>

                {/* Winner details */}
                <div>
                  <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                    🎉 BINGO WINNER! 🎉
                  </h3>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <span className="font-semibold">{winner.playerName}</span>
                    <Badge variant="outline">Card #{winner.cardId}</Badge>
                    <Badge variant="secondary">
                      {typeof winner.pattern === "string"
                        ? winner.pattern
                        : winner.pattern || "Unknown"}
                    </Badge>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-bold">{winner.prizeAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close button */}
              <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
