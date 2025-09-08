"use client"

import type { Winner } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, DollarSign, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface WinnerBannerProps {
  winners: Winner[]
}

export function WinnerBanner({ winners }: WinnerBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible || winners.length === 0) return null

  const totalPrize = winners.reduce((sum, winner) => sum + winner.prizeAmount, 0)

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
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full">
                  <Trophy className="h-6 w-6 text-white" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                    🎉 BINGO WINNER{winners.length > 1 ? "S" : ""}! 🎉
                  </h3>
                  <div className="space-y-1">
                    {winners.map((winner, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{winner.playerName}</span>
                        <Badge variant="outline">Card #{winner.cardId}</Badge>
                        <Badge variant="secondary">
                          {typeof winner.pattern === "string" ? winner.pattern : winner.pattern?.name || "Unknown"}
                        </Badge>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-bold">{winner.prizeAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {winners.length > 1 && (
                    <div className="mt-2 text-lg font-bold text-green-600 dark:text-green-400">
                      Total Prize Pool: ${totalPrize.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

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
