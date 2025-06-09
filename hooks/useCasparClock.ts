"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { getCurrentTime } from "@/lib/utils/time"

interface ClockState {
  currentTime: string
  isConnected: boolean
  isVisible: boolean
  status: string
  autoUpdateEnabled: boolean
  setAutoUpdateEnabled: (enabled: boolean) => void
  updateClock: () => Promise<void>
  toggleOverlay: () => Promise<void>
}

export const useCasparClock = (): ClockState => {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [status, setStatus] = useState<string>("Initializing...")
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(true)

  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleError = (error: unknown, context: string) => {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Error in ${context}:`, error)
    setStatus(`Error in ${context}: ${message}`)
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        setStatus("Connecting to Caspar CG...")
        const response = await fetch("/api/caspar/connect", { method: "POST" })

        if (!response.ok) {
          throw new Error(`Failed to initialize: ${response.statusText}`)
        }

        const data = await response.json()
        setIsConnected(true)
        setStatus(data.connected ? "Connected to Caspar CG" : "Connected (Preview Mode)")
        await fetchCurrentState()

        if (autoUpdateEnabled) {
          startAutoUpdates()
        }
      } catch (error) {
        handleError(error, "connection")
        setIsConnected(true)
        setStatus("Connected (Preview Mode)")
      }
    }

    initialize()
    startPolling()

    return () => {
      stopAutoUpdates()
      stopPolling()
    }
  }, [])

  useEffect(() => {
    if (autoUpdateEnabled) {
      startAutoUpdates()
    } else {
      stopAutoUpdates()
    }
  }, [autoUpdateEnabled])

  const startAutoUpdates = () => {
    stopAutoUpdates()

    const now = new Date()
    const secondsUntilNextMinute = 60 - now.getSeconds()
    const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000 - now.getMilliseconds()

    const timeoutId = setTimeout(() => {
      updateClock()
      const intervalId = setInterval(updateClock, 60000)
      updateIntervalRef.current = intervalId
    }, millisecondsUntilNextMinute)

    updateIntervalRef.current = timeoutId
  }

  const stopAutoUpdates = () => {
    if (updateIntervalRef.current) {
      clearTimeout(updateIntervalRef.current)
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }
  }

  const startPolling = () => {
    stopPolling()
    const intervalId = setInterval(fetchCurrentState, 5000)
    pollIntervalRef.current = intervalId
  }

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  const fetchCurrentState = async () => {
    try {
      const response = await fetch("/api/caspar/status")

      if (!response.ok) {
        throw new Error("Failed to fetch state")
      }

      const data = await response.json()
      setCurrentTime(data.currentTime || getCurrentTime())
      setIsConnected(true)
      setIsVisible(data.isVisible)
    } catch (error) {
      handleError(error, "fetching state")
    }
  }

  const updateClock = useCallback(async () => {
    try {
      setStatus("Updating clock...")
      const timeString = getCurrentTime()
      setCurrentTime(timeString)
      setIsVisible(true)

      const response = await fetch("/api/caspar/clock/update", { method: "POST" })

      if (!response.ok) {
        throw new Error("Failed to update clock")
      }

      const data = await response.json()
      setCurrentTime(data.time)
      setStatus("Clock updated successfully")
      await fetchCurrentState()
    } catch (error) {
      handleError(error, "updating clock")
    }
  }, [])

  const toggleOverlay = useCallback(async () => {
    const newState = !isVisible
    try {
      setStatus(newState ? "Showing overlay..." : "Hiding overlay...")
      setIsVisible(newState)

      const response = await fetch("/api/caspar/clock/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: newState }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle overlay")
      }

      setStatus(newState ? "Overlay shown" : "Overlay hidden")
    } catch (error) {
      handleError(error, "toggling overlay")
      setIsVisible(!newState)
    }
  }, [isVisible])

  return {
    currentTime,
    isConnected,
    isVisible,
    status,
    autoUpdateEnabled,
    setAutoUpdateEnabled,
    updateClock,
    toggleOverlay,
  }
}
