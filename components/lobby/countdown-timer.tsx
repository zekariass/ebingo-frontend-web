"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface CountdownTimerProps {
  targetTime: string
  label?: string
}

export function CountdownTimer({ targetTime, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetTime).getTime()
      const now = Date.now()
      const difference = target - now
      return Math.max(0, Math.floor(difference / 1000))
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [targetTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getVariant = () => {
    if (timeLeft <= 30) return "destructive"
    if (timeLeft <= 120) return "secondary"
    return "outline"
  }

  return (
    <div className="text-center space-y-1">
      {label && <div className="text-xs text-muted-foreground">{label}</div>}
      <Badge variant={getVariant()} className="font-mono text-sm px-3 py-1">
        {formatTime(timeLeft)}
      </Badge>
    </div>
  )
}
