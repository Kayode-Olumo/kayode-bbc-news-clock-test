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

export function useCasparClock(): ClockState {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [isConnected, setIsConnected] = useState<boolean>(true) // Default to true for better UX
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [status, setStatus] = useState<string>("Initializing...")
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(true)

  // Use refs to track intervals
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize connection and clock updates
  useEffect(() => {
    const initialize = async () => {
      try {
        setStatus("Connecting to Caspar CG...")

        const response = await fetch("/api/caspar/connect", { method: "POST" })

        if (!response.ok) {
          throw new Error(`Failed to initialize: ${response.statusText}`)
        }

        const data = await response.json()
        // Always set to true in preview mode for better UX
        setIsConnected(true)
        setStatus(data.connected ? "Connected to Caspar CG" : "Connected (Preview Mode)")

        // Get initial state
        await fetchCurrentState()

        // Start auto-updates if enabled
        if (autoUpdateEnabled) {
          startAutoUpdates()
        }
      } catch (error) {
        console.error("Connection error:", error)
        // Still set to true in preview mode for better UX
        setIsConnected(true)
        setStatus("Connected (Preview Mode)")
      }
    }

    initialize()

    // Set up polling for state updates
    startPolling()

    // Cleanup on unmount
    return () => {
      stopAutoUpdates()
      stopPolling()
    }
  }, [])

  // Watch for changes to autoUpdateEnabled
  useEffect(() => {
    if (autoUpdateEnabled) {
      startAutoUpdates()
    } else {
      stopAutoUpdates()
    }
  }, [autoUpdateEnabled])

  // Start the auto-update mechanism
  const startAutoUpdates = () => {
    // Clear any existing interval
    stopAutoUpdates()

    // Calculate time until the next minute
    const now = new Date()
    const secondsUntilNextMinute = 60 - now.getSeconds()
    const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000 - now.getMilliseconds()

    console.log(`Next auto-update in ${secondsUntilNextMinute} seconds`)

    // Schedule the first update at the next minute
    const timeoutId = setTimeout(() => {
      // Update the clock
      updateClock()

      // Then set up the interval for subsequent updates
      const intervalId = setInterval(() => {
        updateClock()
      }, 60000) // Every minute

      updateIntervalRef.current = intervalId
    }, millisecondsUntilNextMinute)

    // Store the timeout ID
    updateIntervalRef.current = timeoutId
  }

  // Stop the auto-update mechanism
  const stopAutoUpdates = () => {
    if (updateIntervalRef.current) {
      clearTimeout(updateIntervalRef.current)
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }
  }

  // Start polling for state
  const startPolling = () => {
    // Clear any existing interval
    stopPolling()

    // Set up new polling interval
    const intervalId = setInterval(fetchCurrentState, 5000)
    pollIntervalRef.current = intervalId
  }

  // Stop polling for state
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  // Fetch current state from the server
  const fetchCurrentState = async () => {
    try {
      const response = await fetch("/api/caspar/status")

      if (!response.ok) {
        throw new Error("Failed to fetch state")
      }

      const data = await response.json()
      setCurrentTime(data.currentTime || getCurrentTime())
      // Always set to true in preview mode for better UX
      setIsConnected(true)
      setIsVisible(data.isVisible)
    } catch (error) {
      console.error("Error fetching state:", error)
    }
  }

  // Update the clock
  const updateClock = useCallback(async () => {
    try {
      setStatus("Updating clock...")

      // Update the time locally first for better UX
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

      // Refresh state
      await fetchCurrentState()
    } catch (error) {
      setStatus(`Error updating clock: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [])

  // Toggle the overlay visibility
  const toggleOverlay = useCallback(async () => {
    const newState = !isVisible
    try {
      setStatus(newState ? "Showing overlay..." : "Hiding overlay...")

      // Update locally first for better UX
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
      setStatus(`Error toggling overlay: ${error instanceof Error ? error.message : String(error)}`)
      // Revert on error
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
