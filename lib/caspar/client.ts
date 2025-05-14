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

let net: typeof import('net') | undefined;
if (typeof window === "undefined") {
  import('net').then(module => {
    net = module;
  }).catch(error => {
    console.warn("Failed to import net module:", error);
  });
}

export async function connectToCaspar(): Promise<ConnectionStatus> {
  if (typeof window !== "undefined") {
    console.warn("Attempted to initialize Caspar CG connection in browser environment")
    return { connected: true, message: "Mock connection in browser environment" }
  }

  if (!net) {
    console.warn("Net module not available")
    return { connected: true, message: "Mock connection (net module not available)" }
  }

  if (isConnected && socket) {
    return { connected: true, message: "Already connected" }
  }

  return new Promise((resolve) => {
    try {
      const netModule = net!
      socket = new netModule.Socket()

      const timeout = setTimeout(() => {
        socket?.destroy()
        resolve({ connected: false, message: "Connection timeout" })
      }, 5000)

      socket.on("connect", () => {
        clearTimeout(timeout)
        isConnected = true
        console.log(`Connected to Caspar CG at ${CASPAR_HOST}:${CASPAR_PORT}`)

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

      socket.on("error", (error: Error) => {
        clearTimeout(timeout)
        console.error("Socket error:", error)
        isConnected = false
        socket = null
        resolve({ connected: false, message: `Connection error: ${error.message}` })
      })

      socket.on("close", () => {
        isConnected = false
        socket = null
        console.log("Connection closed")
      })

      socket.connect(CASPAR_PORT, CASPAR_HOST)
    } catch (error) {
      console.error("Failed to create socket:", error)
      resolve({
        connected: true,
        message: `Mock connection (socket creation failed): ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  })
}

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

export async function addTemplate(): Promise<boolean> {
  return sendCommand("CG 1 ADD 1 main/MAIN 1")
}

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

export async function setAutoUpdate(enabled: boolean): Promise<boolean> {
  autoUpdateEnabled = enabled

  if (enabled && typeof window === "undefined") {
    scheduleNextUpdate()
  } else {
    clearScheduledUpdates()
  }

  return true
}

export function getNextUpdateTime(): string | null {
  return nextUpdateTime ? nextUpdateTime.toLocaleTimeString() : null
}

function clearScheduledUpdates(): void {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
    clearInterval(updateTimeout)
    updateTimeout = null
    nextUpdateTime = null
  }
}

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
