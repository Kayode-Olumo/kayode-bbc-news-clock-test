import {
  connectToCaspar,
  sendCommand,
  updateClock,
  toggleOverlay,
  getCasparStatus,
} from "@/lib/caspar/client"

// Mock the net module
jest.mock("net", () => {
  interface MockSocket {
    connect: jest.Mock;
    on: jest.Mock;
    write: jest.Mock;
    destroy: jest.Mock;
  }

  const mockSocket: MockSocket = {
    connect: jest.fn((port, host, callback) => {
      // Simulate successful connection
      if (callback) callback()
    }),
    on: jest.fn((event, callback) => {
      // Simulate connection event
      if (event === "connect") {
        callback()
      }
      return mockSocket
    }),
    write: jest.fn((data, callback) => {
      // Simulate successful write
      if (callback) callback()
    }),
    destroy: jest.fn(),
  }

  return {
    Socket: jest.fn(() => mockSocket),
  }
})

describe("Caspar Client", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("connectToCaspar connects to Caspar CG server", async () => {
    const result = await connectToCaspar()
    expect(result.connected).toBe(true)
  })

  test("sendCommand formats and sends AMCP command", async () => {
    // First connect
    await connectToCaspar()

    // Then send a command
    const result = await sendCommand("TEST COMMAND")
    expect(result).toBe(true)
  })

  test("updateClock sends correct command with formatted time", async () => {
    // Mock Date to return a fixed time
    const mockDate = new Date(2023, 0, 1, 14, 30)
    jest.spyOn(global, "Date").mockImplementation(() => mockDate)

    // First connect
    await connectToCaspar()

    // Then update the clock
    const result = await updateClock()
    expect(result.success).toBe(true)
    expect(result.time).toBe("14:30")

    // Restore Date
    jest.restoreAllMocks()
  })

  test("toggleOverlay sends correct command", async () => {
    // First connect
    await connectToCaspar()

    // Test showing the overlay
    let result = await toggleOverlay(true)
    expect(result).toBe(true)

    // Test hiding the overlay
    result = await toggleOverlay(false)
    expect(result).toBe(true)
  })

  test("getCasparStatus returns the current state", async () => {
    // First connect
    await connectToCaspar()

    // Update the clock to set the state
    await updateClock()

    // Get the current state
    const state = getCasparStatus()
    expect(state.isConnected).toBe(true)
    expect(state.currentTime).toBeTruthy()
  })
})
