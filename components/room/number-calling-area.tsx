"use client"

import { useRoomStore } from "@/lib/stores/room-store"
import { useSoundEffects } from "@/lib/hooks/use-sound-effects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PatternDisplay } from "./pattern-display"
import { GameTimerDisplay } from "./game-timer-display"
import { PatternProgress } from "./pattern-progress"
import { formatBingoNumber } from "@/lib/utils/bingo"
import { History, Volume2, VolumeX, Target } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GameSettings } from "./game-settings"

export function NumberCallingArea() {
  const { currentNumber, calledNumbers, pattern } = useRoomStore()
  const { numberCalled, enabled: soundEnabled } = useSoundEffects()
  const [previousNumber, setPreviousNumber] = useState<number | null>(null)

  useEffect(() => {
    if (currentNumber && currentNumber !== previousNumber) {
      numberCalled()
      setPreviousNumber(currentNumber)

      const letter =
        currentNumber <= 15
          ? "B"
          : currentNumber <= 30
            ? "I"
            : currentNumber <= 45
              ? "N"
              : currentNumber <= 60
                ? "G"
                : "O"
      console.log("Number Called:", `${letter} ${currentNumber}`)
    }
  }, [currentNumber, previousNumber, numberCalled])

  useEffect(() => {
    const mockCalledNumbers = [7, 23, 42, 56, 71, 15, 38, 49, 63]
    const { setCalledNumbers, setCurrentNumber, setPattern } = useRoomStore.getState()

    if (calledNumbers.length === 0) {
      setCalledNumbers(mockCalledNumbers)
      setCurrentNumber(mockCalledNumbers[mockCalledNumbers.length - 1])
      setPattern("line")
    }
  }, [calledNumbers.length])

  const lastFiveCalls = calledNumbers.slice(-5).reverse()

  return (
    <div className="space-y-4">
      {/* Game Timer */}
      {/* <GameTimerDisplay /> */}

      {/* Current Pattern */}
      <div className="hidden md:block">
        <PatternDisplay pattern={pattern} />
      </div>

      {/* Number Calling */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Number Calling</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Called Numbers History</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-5 gap-2 p-4">
                      {calledNumbers.map((number, index) => (
                        <Badge key={index} variant="outline" className="justify-center py-2">
                          {formatBingoNumber(number)}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Number */}
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">Current Number</div>
            <AnimatePresence mode="wait">
              {currentNumber ? (
                <motion.div
                  key={currentNumber}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-6xl font-bold text-primary"
                >
                  {formatBingoNumber(currentNumber)}
                </motion.div>
              ) : (
                <div className="text-2xl text-muted-foreground">Waiting for next number...</div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent Calls */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground text-center">Recent Calls</div>
            <div className="flex justify-center gap-2 flex-wrap">
              {lastFiveCalls.map((number, index) => (
                <motion.div
                  key={number}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge
                    variant="outline"
                    className={`text-sm px-3 py-1 ${index === 0 ? "border-primary text-primary" : ""}`}
                  >
                    {formatBingoNumber(number)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold">{calledNumbers.length}</div>
              <div className="text-muted-foreground">Numbers Called</div>
            </div>
            <div>
              <div className="font-semibold">{75 - calledNumbers.length}</div>
              <div className="text-muted-foreground">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Progress */}
      <PatternProgress />

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full bg-transparent">
            <Target className="h-4 w-4 mr-2" />
            Game Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
          </DialogHeader>
          <GameSettings />
        </DialogContent>
      </Dialog>
    </div>
  )
}
