"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseWebSocketReconnectOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  onReconnectAttempt?: (attempt: number) => void
  onReconnectSuccess?: () => void
  onReconnectFailed?: () => void
  onMaxAttemptsReached?: () => void
}

interface ReconnectState {
  isReconnecting: boolean
  attempts: number
  nextAttemptIn: number
  maxAttemptsReached: boolean
}

export function useWebSocketReconnect({
  maxAttempts = 5,
  baseDelay = 1000,
  maxDelay = 30000,
  backoffFactor = 2,
  onReconnectAttempt,
  onReconnectSuccess,
  onReconnectFailed,
  onMaxAttemptsReached,
}: UseWebSocketReconnectOptions = {}) {
  const [state, setState] = useState<ReconnectState>({
    isReconnecting: false,
    attempts: 0,
    nextAttemptIn: 0,
    maxAttemptsReached: false,
  })

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate delay with exponential backoff and jitter
  const calculateDelay = useCallback(
    (attempt: number) => {
      const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt)
      const cappedDelay = Math.min(exponentialDelay, maxDelay)
      const jitter = Math.random() * 1000 // Add up to 1 second of jitter
      return Math.floor(cappedDelay + jitter)
    },
    [baseDelay, backoffFactor, maxDelay],
  )

  // Start countdown timer
  const startCountdown = useCallback((delay: number) => {
    let remaining = Math.ceil(delay / 1000)
    setState((prev) => ({ ...prev, nextAttemptIn: remaining }))

    const updateCountdown = () => {
      remaining -= 1
      setState((prev) => ({ ...prev, nextAttemptIn: remaining }))

      if (remaining > 0) {
        countdownRef.current = setTimeout(updateCountdown, 1000)
      }
    }

    if (remaining > 0) {
      countdownRef.current = setTimeout(updateCountdown, 1000)
    }
  }, [])

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (countdownRef.current) {
      clearTimeout(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  // Start reconnection process
  const startReconnect = useCallback(
    (connectFn: () => Promise<boolean> | boolean) => {
      if (state.maxAttemptsReached || state.isReconnecting) {
        return
      }

      setState((prev) => ({
        ...prev,
        isReconnecting: true,
        attempts: prev.attempts + 1,
      }))

      const currentAttempt = state.attempts + 1
      onReconnectAttempt?.(currentAttempt)

      if (currentAttempt >= maxAttempts) {
        setState((prev) => ({
          ...prev,
          isReconnecting: false,
          maxAttemptsReached: true,
          nextAttemptIn: 0,
        }))
        onMaxAttemptsReached?.()
        return
      }

      const delay = calculateDelay(currentAttempt - 1)
      startCountdown(delay)

      timeoutRef.current = setTimeout(async () => {
        try {
          const success = await connectFn()

          if (success) {
            // Reconnection successful
            setState({
              isReconnecting: false,
              attempts: 0,
              nextAttemptIn: 0,
              maxAttemptsReached: false,
            })
            onReconnectSuccess?.()
          } else {
            // Reconnection failed, try again
            setState((prev) => ({ ...prev, isReconnecting: false }))
            onReconnectFailed?.()

            // Schedule next attempt
            setTimeout(() => startReconnect(connectFn), 100)
          }
        } catch (error) {
          setState((prev) => ({ ...prev, isReconnecting: false }))
          onReconnectFailed?.()

          // Schedule next attempt
          setTimeout(() => startReconnect(connectFn), 100)
        }
      }, delay)
    },
    [
      state.maxAttemptsReached,
      state.isReconnecting,
      state.attempts,
      maxAttempts,
      calculateDelay,
      startCountdown,
      onReconnectAttempt,
      onReconnectSuccess,
      onReconnectFailed,
      onMaxAttemptsReached,
    ],
  )

  // Reset reconnection state
  const reset = useCallback(() => {
    clearTimers()
    setState({
      isReconnecting: false,
      attempts: 0,
      nextAttemptIn: 0,
      maxAttemptsReached: false,
    })
  }, [clearTimers])

  // Stop reconnection process
  const stop = useCallback(() => {
    clearTimers()
    setState((prev) => ({
      ...prev,
      isReconnecting: false,
      nextAttemptIn: 0,
    }))
  }, [clearTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  return {
    ...state,
    startReconnect,
    reset,
    stop,
    canReconnect: !state.maxAttemptsReached && !state.isReconnecting,
  }
}
