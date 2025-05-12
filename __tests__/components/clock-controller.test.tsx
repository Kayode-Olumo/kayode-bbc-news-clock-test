import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ClockController from "@/components/caspar/ClockController";
import { useCasparClock } from "@/hooks/useCasparClock";

// Mock the useCasparClock hook
jest.mock("@/hooks/useCasparClock", () => ({
  useCasparClock: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe("ClockController", () => {
  beforeEach(() => {
    // Default mock implementation
    (useCasparClock as jest.Mock).mockReturnValue({
      currentTime: "12:34",
      isConnected: true,
      isVisible: false,
      status: "Connected",
      updateClock: jest.fn(),
      toggleOverlay: jest.fn(),
    });
  });

  test("renders the current time", () => {
    render(<ClockController />);
    expect(screen.getByText("12:34")).toBeInTheDocument();
  });

  test("shows connected status when connected", () => {
    render(<ClockController />);
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  test("shows disconnected status when not connected", () => {
    (useCasparClock as jest.Mock).mockReturnValue({
      currentTime: "--:--",
      isConnected: false,
      isVisible: false,
      status: "Disconnected",
      updateClock: jest.fn(),
      toggleOverlay: jest.fn(),
    });

    render(<ClockController />);
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  test("calls updateClock when update button is clicked", () => {
    const updateClock = jest.fn();
    (useCasparClock as jest.Mock).mockReturnValue({
      currentTime: "12:34",
      isConnected: true,
      isVisible: false,
      status: "Connected",
      updateClock,
      toggleOverlay: jest.fn(),
    });

    render(<ClockController />);
    fireEvent.click(screen.getByText("Update Clock Now"));
    expect(updateClock).toHaveBeenCalled();
  });

  test("calls toggleOverlay when show/hide button is clicked", () => {
    const toggleOverlay = jest.fn();
    (useCasparClock as jest.Mock).mockReturnValue({
      currentTime: "12:34",
      isConnected: true,
      isVisible: false,
      status: "Connected",
      updateClock: jest.fn(),
      toggleOverlay,
    });

    render(<ClockController />);
    fireEvent.click(screen.getByText("Show Overlay"));
    expect(toggleOverlay).toHaveBeenCalled();
  });

  test("toggles auto-update when button is clicked", async () => {
    render(<ClockController />);

    // Initially enabled
    expect(screen.getByText("Disable Auto-Update")).toBeInTheDocument();

    // Click to disable
    fireEvent.click(screen.getByText("Disable Auto-Update"));

    // Wait for state update
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/clock/auto-update",
        expect.any(Object)
      );
    });
  });
});
