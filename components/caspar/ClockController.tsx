"use client";
import { useCasparClock } from "@/hooks/useCasparClock";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export default function ClockController() {
  const {
    currentTime,
    isConnected,
    isVisible,
    updateClock,
    toggleOverlay,
    status,
    autoUpdateEnabled,
    setAutoUpdateEnabled,
  } = useCasparClock();

  const handleToggleAutoUpdate = async () => {
    try {
      // Toggle the auto-update state through the hook
      setAutoUpdateEnabled(!autoUpdateEnabled);

      // Also notify the server
      await fetch("/api/caspar/settings/auto-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !autoUpdateEnabled }),
      });
    } catch (error) {
      console.error("Failed to toggle auto-update:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clock Controller</CardTitle>
        <CardDescription>Manage the BBC News clock display</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium mb-1">Current Time</p>
            <p className="text-2xl font-bold">{currentTime || "--:--"}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Status</p>
            <p
              className={`text-sm ${
                isConnected ? "text-green-500" : "text-red-500"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </p>
            <p className="text-sm mt-1">
              Overlay: {isVisible ? "Visible" : "Hidden"}
            </p>
            <p className="text-sm mt-1">
              Auto-Update: {autoUpdateEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500 mt-2">{status}</div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={updateClock} variant="default">
          Update Clock Now
        </Button>

        <Button
          onClick={toggleOverlay}
          variant={isVisible ? "destructive" : "outline"}
        >
          {isVisible ? "Hide Overlay" : "Show Overlay"}
        </Button>

        <Button
          onClick={handleToggleAutoUpdate}
          variant={autoUpdateEnabled ? "default" : "outline"}
          className="ml-auto"
        >
          {autoUpdateEnabled ? "Disable Auto-Update" : "Enable Auto-Update"}
        </Button>
      </CardFooter>
    </Card>
  );
}
