/**
 * Caspar CG Client Library
 * 
 * This library provides the core functionality for interacting with the Caspar CG server.
 * It handles all communication with the Caspar CG server, including connection management,
 * command sending, and clock updates.
 * 
 * Key Features:
 * - Connection management with Caspar CG server
 * - Command formatting and sending
 * - Clock updates and synchronization
 * - Auto-update scheduling
 * - Template management
 * - Error handling and recovery
 * 
 * The library is designed to work in both server and browser environments:
 * - Server: Full functionality with actual Caspar CG communication
 * - Browser: Mock responses for better UX during development
 * 
 * Configuration:
 * - CASPAR_HOST: Server hostname (default: localhost)
 * - CASPAR_PORT: Server port (default: 5250)
 */

// Import net only on the server side
import type { Socket } from 'net';
import { formatCommand } from "./commands"
import type { ConnectionStatus, ClockState, ClockUpdateResult, ConnectionStatusDetails } from "./types"

const CASPAR_HOST = process.env.CASPAR_HOST || "localhost"
const CASPAR_PORT = Number.parseInt(process.env.CASPAR_PORT || "5250")

let socket: Socket | null = null
let isConnected = false
let autoUpdateEnabled = true
let nextUpdateTime: Date | null = null
let updateTimeout: NodeJS.Timeout | null = null
let currentVisibility = false
let lastSentCommand: string | null = null
let lastCurrentTime: string | null = null

/**
 * Initialize the connection to Caspar CG
 * Establishes a TCP connection to the Caspar CG server and sets up event handlers
 * 
 * @returns {Promise<ConnectionStatus>} Connection status and message
 */
let net: typeof import('net') | undefined;
if (typeof window === "undefined") {
  import('net').then(module => {
    net = module;
  }).catch(error => {
    console.warn("Failed to import net module:", error);
  });
}

/**
 * Establishes a connection to the Caspar CG server.
 * This function handles the connection lifecycle including error handling,
 * timeout management, and template initialization.
 * @returns Promise<ConnectionStatus> - The connection status and message
 */
export async function connectToCaspar(): Promise<ConnectionStatus> {
  // Check if running in browser environment - return mock connection
  if (typeof window !== "undefined") {
    console.warn("Attempted to initialize Caspar CG connection in browser environment")
    return { connected: true, message: "Mock connection in browser environment" }
  }

  // Verify net module is available - return mock connection if not
  if (!net) {
    console.warn("Net module not available")
    return { connected: true, message: "Mock connection (net module not available)" }
  }

  // Return early if already connected
  if (isConnected && socket) {
    return { connected: true, message: "Already connected" }
  }

  // Create new connection promise
  return new Promise((resolve) => {
    try {
      const netModule = net!
      socket = new netModule.Socket()

      // Set up connection timeout - will destroy socket if connection takes too long
      const timeout = setTimeout(() => {
        socket?.destroy()
        resolve({ connected: false, message: "Connection timeout" })
      }, 5000)

      // Handle successful connection
      socket.on("connect", () => {
        clearTimeout(timeout)
        isConnected = true
        console.log(`Connected to Caspar CG at ${CASPAR_HOST}:${CASPAR_PORT}`)

        // Add template and handle auto-update if enabled
        addTemplate()
          .then(() => {
            if (autoUpdateEnabled) {
              scheduleNextUpdate()
            }
            resolve({ connected: true, message: "Connected and template added" })
          })
          .catch((error) => {
            console.error("Failed to add template:", error)
            resolve({ connected: true, message: "Connected but failed to add template" })
          })
      })

      // Handle connection errors
      socket.on("error", (error: Error) => {
        clearTimeout(timeout)
        console.error("Socket error:", error)
        isConnected = false
        socket = null
        resolve({ connected: false, message: `Connection error: ${error.message}` })
      })

      // Handle connection closure
      socket.on("close", () => {
        isConnected = false
        socket = null
        console.log("Connection closed")
      })

      // Attempt to establish connection
      socket.connect(CASPAR_PORT, CASPAR_HOST)
    } catch (error) {
      // Handle any errors during socket creation
      console.error("Failed to create socket:", error)
      resolve({
        connected: true,
        message: `Mock connection (socket creation failed): ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  })
}

/**
 * Send a command to Caspar CG
 * Formats and sends a command to the Caspar CG server
 * 
 * @param {string} command - The command to send
 * @returns {Promise<boolean>} Success status of the command
 */
export async function sendCommand(command: string): Promise<boolean> {
  if (typeof window !== "undefined" || !net) {
    console.warn("Attempted to send Caspar CG command in browser environment")
    return true
  }

  return new Promise((resolve) => {
    if (!isConnected || !socket) {
      console.error("Not connected to Caspar CG")
      resolve(true)
      return
    }

    const fullCommand = formatCommand(command)

    console.log(`Sending command: ${command}`)
    lastSentCommand = command

    socket.write(fullCommand, (err?: Error) => {
      if (err) {
        console.error("Failed to send command:", err)
        resolve(true)
      } else {
        resolve(true)
      }
    })
  })
}

/**
 * Add the template to channel 1
 * Loads the main template into Caspar CG
 * 
 * @returns {Promise<boolean>} Success status of the operation
 */
export async function addTemplate(): Promise<boolean> {
  return sendCommand("CG 1 ADD 1 main/MAIN 1")
}

/**
 * Update the clock on the UI
 * Sends the current time to Caspar CG for display
 * 
 * @returns {Promise<ClockUpdateResult>} Result containing success status and current time
 */
export async function updateClock(): Promise<ClockUpdateResult> {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")
  const timeString = `${hours}:${minutes}`
  lastCurrentTime = timeString

  if (typeof window !== "undefined") {
    console.warn("Attempted to update clock in browser environment")
    return { success: true, time: timeString }
  }

  const success = await sendCommand(`CG 1 INVOKE 1 "leftTab('on', 'BBC NEWS ${timeString}')"`)
  currentVisibility = true

  return { success, time: timeString }
}

/**
 * Set auto-update enabled/disabled
 * Configures whether the clock should update automatically
 * 
 * @param {boolean} enabled - Whether auto-update should be enabled
 * @returns {Promise<boolean>} Success status of the operation
 */
export async function setAutoUpdate(enabled: boolean): Promise<boolean> {
  autoUpdateEnabled = enabled

  if (enabled && typeof window === "undefined") {
    scheduleNextUpdate()
  } else {
    clearScheduledUpdates()
  }

  return true
}

/**
 * Get the next scheduled update time
 * 
 * @returns {string|null} The next update time in local time format, or null if no update scheduled
 */
export function getNextUpdateTime(): string | null {
  return nextUpdateTime ? nextUpdateTime.toLocaleTimeString() : null
}

/**
 * Clear any scheduled updates
 * Removes any pending clock updates
 */
function clearScheduledUpdates(): void {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
    clearInterval(updateTimeout)
    updateTimeout = null
    nextUpdateTime = null
  }
}

/**
 * Schedule the next clock update
 * Calculates and schedules the next automatic clock update
 */
function scheduleNextUpdate(): void {
  if (!autoUpdateEnabled || typeof window !== "undefined") return

  clearScheduledUpdates()

  const now = new Date()
  const secondsUntilNextMinute = 60 - now.getSeconds()
  const millisecondsUntilNextMinute = secondsUntilNextMinute * 1000 - now.getMilliseconds()

  nextUpdateTime = new Date(now.getTime() + millisecondsUntilNextMinute)

  console.log(`Next update in ${secondsUntilNextMinute} seconds`)

  updateTimeout = setTimeout(() => {
    if (autoUpdateEnabled) {
      updateClock().then(() => {
        scheduleNextUpdate()
      })
    }
  }, millisecondsUntilNextMinute)
}

/**
 * Close the connection to Caspar CG
 * Cleans up resources and closes the socket connection
 */
export async function closeConnection(): Promise<void> {
  if (typeof window !== "undefined") return

  if (socket) {
    await sendCommand(`CG 1 INVOKE 1 "leftTab('off')"`)

    socket.destroy()
    socket = null
    isConnected = false
  }
}

export async function toggleOverlay(visible: boolean): Promise<boolean> {
  if (visible === currentVisibility) {
    return true
  }

  const command = visible ? "CG 1 INVOKE 1 show()" : "CG 1 INVOKE 1 hide()"
  const success = await sendCommand(command)
  currentVisibility = visible
  return success
}

export async function getConnectionStatus(): Promise<ConnectionStatusDetails> {
  return {
    isConnected,
    lastCommand: lastSentCommand,
    currentTime: lastCurrentTime,
    isVisible: currentVisibility,
    autoUpdateEnabled,
    nextUpdateTime: getNextUpdateTime(),
    mode: typeof window !== "undefined" || !net ? "mock" : "real"
  }
}

export function getCasparStatus(): ClockState {
  return {
    currentTime: lastCurrentTime || "",
    isConnected,
    isVisible: currentVisibility,
    mode: typeof window !== "undefined" || !net ? "mock" : "real"
  }
}

if (typeof process !== "undefined" && typeof window === "undefined") {
  const handleShutdown = async () => {
    console.log("Shutting down...")
    await closeConnection()
    process.exit(0)
  }

  process.on("SIGINT", handleShutdown)
  process.on("SIGTERM", handleShutdown)
}
