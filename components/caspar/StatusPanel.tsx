import { getConnectionStatus } from "@/lib/caspar/client";

export default async function StatusPanel() {
  const status = await getConnectionStatus();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">System Status</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Connection Status</p>
          <p
            className={`text-sm ${
              status.isConnected ? "text-green-500" : "text-red-500"
            }`}
          >
            {status.isConnected ? "Connected" : "Disconnected"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Last Command</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {status.lastCommand || "None"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Next Update</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {status.nextUpdateTime || "Not scheduled"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Auto-Update</p>
          <p
            className={`text-sm ${
              status.autoUpdateEnabled ? "text-green-500" : "text-yellow-500"
            }`}
          >
            {status.autoUpdateEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>
      </div>
    </div>
  );
}
