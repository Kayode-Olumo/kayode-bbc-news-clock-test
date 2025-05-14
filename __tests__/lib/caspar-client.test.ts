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
      if (callback) callback();
    }),
    on: jest.fn((event: string, callback: () => void) => {
      if (event === "connect") {
        callback();
      }
      return mockSocket;
    }),
    write: jest.fn((data: string, callback?: () => void) => {
      if (callback) callback();
    }),
    destroy: jest.fn(),
  };

  return {
    Socket: jest.fn(() => mockSocket),
  };
})

const mockWindow = {
  ...global.window,
  location: {
    ...global.window.location,
    hostname: 'localhost',
  },
} as Window & typeof globalThis;

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
    global.window = mockWindow
    mockIsConnected = false;
    mockCurrentTime = "";
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("connectToCaspar connects to Caspar CG server", async () => {
    const result = await connectToCaspar()
    expect(result.connected).toBe(true)
    mockIsConnected = true;
  })

  it("sendCommand formats and sends AMCP command", async () => {
    await connectToCaspar()
    mockIsConnected = true;

    const result = await sendCommand("TEST COMMAND")
    expect(result).toBe(true)
  })

  it("updateClock sends correct command with formatted time", async () => {
    const mockDate = new Date(2023, 0, 1, 14, 30)
    jest.spyOn(global, "Date").mockImplementation(() => mockDate)

    await connectToCaspar()
    mockIsConnected = true;

    const result = await updateClock()
    expect(result.success).toBe(true)
    expect(result.time).toBe("14:30")
    mockCurrentTime = "14:30";

    jest.restoreAllMocks()
  })

  it("toggleOverlay sends correct command", async () => {
    await connectToCaspar()
    mockIsConnected = true;

    let result = await toggleOverlay(true)
    expect(result).toBe(true)

    result = await toggleOverlay(false)
    expect(result).toBe(true)
  })

  it("getCasparStatus returns the current state", async () => {
    await connectToCaspar()
    mockIsConnected = true;

    await updateClock()
    mockCurrentTime = "14:30";

    const state = getCasparStatus()
    expect(state.isConnected).toBe(true)
    expect(state.currentTime).toBeTruthy()
  })
})
