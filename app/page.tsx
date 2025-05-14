/**
 * BBC News Clock System - Main Page Component
 *
 * This is the main interface for the BBC News Clock System, which manages the synchronization
 * of time displays with Caspar CG server. The system provides both manual and automatic
 * clock updates, with a user-friendly interface for controlling these features.
 *
 * Key Features:
 * - Real-time connection status with Caspar CG server
 * - Manual clock updates
 * - Automatic clock updates with configurable intervals
 * - Persistent settings using localStorage
 * - Error handling and status reporting
 * - Template preview functionality
 *
 * State Management:
 * - status: Tracks the current system status and error messages
 * - currentTime: Stores the last updated time
 * - isConnected: Monitors connection state with Caspar CG
 * - autoUpdateEnabled: Controls automatic update functionality
 * - nextUpdate: Shows when the next automatic update will occur
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [status, setStatus] = useState<string>("Initializing...");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(true);
  const [nextUpdate, setNextUpdate] = useState<string>("");

  /**
   * Error handler for consistent error reporting across the application
   * @param error - The error object or message
   * @param context - The context where the error occurred
   */
  const handleError = (error: unknown, context: string) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error in ${context}:`, error);
    setStatus(`Error in ${context}: ${message}`);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSetting = localStorage.getItem("autoUpdateEnabled");
      if (savedSetting !== null) {
        setAutoUpdateEnabled(savedSetting === "true");
      }
    }
  }, []);

  /**
   * Initializes the connection to Caspar CG and sets up auto-updates if enabled
   * Uses useEffect to run on component mount and when autoUpdateEnabled changes
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        setStatus("Connecting to Caspar CG...");
        const response = await fetch("/api/caspar/connect", { method: "POST" });
        const data = await response.json();

        setIsConnected(data.connected);
        setStatus(data.message);

        if (data.connected && autoUpdateEnabled) {
          startAutoUpdates();
        }
      } catch (error) {
        handleError(error, "connection");
      }
    };

    initialize();
    return () => {
      void stopAutoUpdates();
    };
  }, [autoUpdateEnabled]);

  /**
   * Manages auto-update state changes
   * Starts or stops auto-updates based on the autoUpdateEnabled state
   */
  useEffect(() => {
    if (autoUpdateEnabled) {
      startAutoUpdates();
    } else {
      stopAutoUpdates();
    }
  }, [autoUpdateEnabled]);

  /**
   * Starts the automatic clock update system
   * Configures the server to send updates at regular intervals
   */
  const startAutoUpdates = async () => {
    try {
      const response = await fetch("/api/caspar/settings/auto-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true }),
      });

      const data = await response.json();
      if (data.nextUpdateTime) {
        setNextUpdate(data.nextUpdateTime);
      }
    } catch (error) {
      handleError(error, "starting auto-updates");
    }
  };

  /**
   * Stops the automatic clock update system
   * Disables the server-side auto-update configuration
   */
  const stopAutoUpdates = async () => {
    try {
      await fetch("/api/caspar/settings/auto-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false }),
      });
    } catch (error) {
      handleError(error, "stopping auto-updates");
    }
  };

  /**
   * Manually updates the clock display
   * Sends a request to the server to update the current time
   */
  const updateClock = async () => {
    try {
      setStatus("Updating clock...");
      const response = await fetch("/api/caspar/clock/update", {
        method: "POST",
      });
      const data = await response.json();

      setCurrentTime(data.time);
      setStatus(`Clock updated to ${data.time}`);
    } catch (error) {
      handleError(error, "updating clock");
    }
  };

  /**
   * Toggles the auto-update feature
   * Updates both local state and persists the setting in localStorage
   */
  const toggleAutoUpdate = () => {
    const newValue = !autoUpdateEnabled;
    setAutoUpdateEnabled(newValue);

    if (typeof window !== "undefined") {
      localStorage.setItem("autoUpdateEnabled", newValue.toString());
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-6">BBC News Clock System</h1>

      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Status</h2>
          <p
            className={`mb-1 ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            {isConnected ? "Connected to Caspar CG" : "Not connected"}
          </p>
          <p className="text-sm text-gray-600">{status}</p>

          {currentTime && (
            <p className="mt-2">
              Last update: <span className="font-semibold">{currentTime}</span>
            </p>
          )}

          {nextUpdate && autoUpdateEnabled && (
            <p className="mt-2 text-sm">
              Next update at:{" "}
              <span className="font-semibold">{nextUpdate}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={updateClock}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Update Clock Now
          </button>

          <button
            onClick={toggleAutoUpdate}
            className={`px-4 py-2 rounded transition-colors ${
              autoUpdateEnabled
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {autoUpdateEnabled ? "Disable Auto-Update" : "Enable Auto-Update"}
          </button>

          <Link
            href="/template"
            target="_blank"
            className="px-4 py-2 bg-gray-200 text-center text-gray-800 rounded hover:bg-gray-300 transition-colors mt-2"
          >
            Open Caspar Template
          </Link>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Click &quot;Update Clock Now&quot; to manually update the clock
          </li>
          <li>
            Toggle &quot;Auto-Update&quot; to enable/disable automatic updates
            every minute
          </li>
          <li>
            Click &quot;Open Caspar Template&quot; to view the HTML template in
            a new tab
          </li>
        </ul>
      </div>
    </main>
  );
}
