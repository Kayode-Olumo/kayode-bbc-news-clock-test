import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ClockController from "@/components/caspar/ClockController";
import { useCasparClock } from "@/hooks/useCasparClock";

jest.mock("@/hooks/useCasparClock", () => ({
  useCasparClock: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe("ClockController", () => {
  const defaultMockState = {
    currentTime: "12:34",
    isConnected: true,
    isVisible: false,
    status: "Connected to Caspar CG",
    autoUpdateEnabled: true,
    setAutoUpdateEnabled: jest.fn(),
    updateClock: jest.fn(),
    toggleOverlay: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCasparClock as jest.Mock).mockReturnValue(defaultMockState);
  });

  it("renders the clock controller with all UI elements", () => {
    render(<ClockController />);

    // Check main elements
    expect(screen.getByText("Clock Controller")).toBeInTheDocument();
    expect(
      screen.getByText("Manage the BBC News clock display")
    ).toBeInTheDocument();

    // Check status section
    expect(screen.getByText("Current Time")).toBeInTheDocument();
    expect(screen.getByText("12:34")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("Overlay: Hidden")).toBeInTheDocument();
    expect(screen.getByText("Auto-Update: Enabled")).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText("Update Clock Now")).toBeInTheDocument();
    expect(screen.getByText("Show Overlay")).toBeInTheDocument();
    expect(screen.getByText("Disable Auto-Update")).toBeInTheDocument();
  });

  it("shows correct connection status styling", () => {
    render(<ClockController />);
    const statusElement = screen.getByText("Connected");
    expect(statusElement).toHaveClass("text-green-500");
  });

  it("shows disconnected status when not connected", () => {
    (useCasparClock as jest.Mock).mockReturnValue({
      ...defaultMockState,
      isConnected: false,
      status: "Disconnected",
    });

    render(<ClockController />);
    const statusElement = screen.getByText("Disconnected", {
      selector: "p.text-sm.text-red-500",
    });
    expect(statusElement).toBeInTheDocument();
  });

  it("calls updateClock when update button is clicked", async () => {
    const updateClock = jest.fn();
    (useCasparClock as jest.Mock).mockReturnValue({
      ...defaultMockState,
      updateClock,
    });

    render(<ClockController />);
    fireEvent.click(screen.getByText("Update Clock Now"));
    expect(updateClock).toHaveBeenCalled();
  });

  it("calls toggleOverlay when show/hide button is clicked", async () => {
    const toggleOverlay = jest.fn();
    (useCasparClock as jest.Mock).mockReturnValue({
      ...defaultMockState,
      toggleOverlay,
    });

    render(<ClockController />);
    fireEvent.click(screen.getByText("Show Overlay"));
    expect(toggleOverlay).toHaveBeenCalled();
  });

  it("updates button text based on overlay visibility", () => {
    (useCasparClock as jest.Mock).mockReturnValue({
      ...defaultMockState,
      isVisible: true,
    });

    render(<ClockController />);
    expect(screen.getByText("Hide Overlay")).toBeInTheDocument();
  });

  it("handles auto-update toggle", async () => {
    const setAutoUpdateEnabled = jest.fn();
    (useCasparClock as jest.Mock).mockReturnValue({
      ...defaultMockState,
      setAutoUpdateEnabled,
    });

    render(<ClockController />);
    fireEvent.click(screen.getByText("Disable Auto-Update"));

    await waitFor(() => {
      expect(setAutoUpdateEnabled).toHaveBeenCalledWith(false);
    });
  });

  it("shows correct button variants based on state", () => {
    (useCasparClock as jest.Mock).mockReturnValue({
      ...defaultMockState,
      isVisible: true,
      autoUpdateEnabled: false,
    });

    render(<ClockController />);

    const hideButton = screen.getByText("Hide Overlay");
    const enableButton = screen.getByText("Enable Auto-Update");

    expect(hideButton).toHaveClass("bg-destructive");
    expect(enableButton).toHaveClass("border-input");
  });

  it("displays status messages", () => {
    const statusMessage = "Updating clock...";
    (useCasparClock as jest.Mock).mockReturnValue({
      ...defaultMockState,
      status: statusMessage,
    });

    render(<ClockController />);
    expect(screen.getByText(statusMessage)).toBeInTheDocument();
  });
});
