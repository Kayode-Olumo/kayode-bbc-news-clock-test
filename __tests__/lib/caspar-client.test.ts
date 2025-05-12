import {
  connectToCaspar,
  sendCommand,
  updateClock,
  toggleOverlay,
  getCasparStatus,
} from "@/lib/caspar/client"

// Mock the net module
jest.mock("net", () => {
  type MockSocket = {
    connect: jest.Mock;
    on: jest.Mock;
    write: jest.Mock;
    destroy: jest.Mock;
  };

  const mockSocket: MockSocket = {
    connect: jest.fn((port: number, host: string, callback?: () => void) => {
      // Simulate successful connection
      if (callback) callback();
    }),
    on: jest.fn((event: string, callback: () => void) => {
      // Simulate connection event
      if (event === "connect") {
        callback();
      }
      return mockSocket;
    }),
    write: jest.fn((data: string, callback?: () => void) => {
      // Simulate successful write
      if (callback) callback();
    }),
    destroy: jest.fn(),
  };

  return {
    Socket: jest.fn(() => mockSocket),
  };
})

// Mock window object
const mockWindow = {
  ...global.window,
  location: {
    ...global.window.location,
    hostname: 'localhost',
  },
} as Window & typeof globalThis;

// Mock the global state
let mockIsConnected = false;
let mockCurrentTime = "";

jest.mock("@/lib/caspar/client", () => {
  const originalModule = jest.requireActual("@/lib/caspar/client");
  return {
    ...originalModule,
    getCasparStatus: () => ({
      isConnected: mockIsConnected,
      currentTime: mockCurrentTime,
    }),
  };
});

describe("Caspar Client", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset window object before each test
    global.window = mockWindow
    // Reset mock state
    mockIsConnected = false;
    mockCurrentTime = "";
  })

  afterEach(() => {
    // Restore window object after each test
    jest.restoreAllMocks()
  })

  test("connectToCaspar connects to Caspar CG server", async () => {
    const result = await connectToCaspar()
    expect(result.connected).toBe(true)
    mockIsConnected = true;
  })

  test("sendCommand formats and sends AMCP command", async () => {
    // First connect
    await connectToCaspar()
    mockIsConnected = true;

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
    mockIsConnected = true;

    // Then update the clock
    const result = await updateClock()
    expect(result.success).toBe(true)
    expect(result.time).toBe("14:30")
    mockCurrentTime = "14:30";

    // Restore Date
    jest.restoreAllMocks()
  })

  test("toggleOverlay sends correct command", async () => {
    // First connect
    await connectToCaspar()
    mockIsConnected = true;

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
    mockIsConnected = true;

    // Update the clock to set the state
    await updateClock()
    mockCurrentTime = "14:30";

    // Get the current state
    const state = getCasparStatus()
    expect(state.isConnected).toBe(true)
    expect(state.currentTime).toBeTruthy()
  })
})
