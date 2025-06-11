/**
 * Auto-Update Settings API Route
 * 
 * This route manages the automatic clock update settings in Caspar CG. It provides
 * a POST endpoint that enables or disables the automatic update feature.
 * 
 * The route handles:
 * 1. Toggling the auto-update feature on/off
 * 2. Validating the request payload
 * 3. Persisting the auto-update setting
 * 
 * @param {Request} request - The incoming HTTP request containing:
 *   - enabled: boolean indicating whether auto-update should be enabled
 * 
 * @returns {Object} JSON response containing:
 *   - success: boolean indicating if the setting was updated successfully
 *   - autoUpdateEnabled: boolean reflecting the current setting
 *   - error: string with error message (on failure)
 */

import { NextResponse } from "next/server"
import { setAutoUpdate } from "@/lib/caspar/client"

/**
 * POST handler for managing auto-update settings
 * Validates the request and updates the auto-update configuration
 */
export async function POST(request: Request) {
  try {
    const { enabled } = await request.json()

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid request: 'enabled' must be a boolean" }, { status: 400 })
    }

    await setAutoUpdate(enabled)

    return NextResponse.json({
      success: true,
      autoUpdateEnabled: enabled,
    })
  } catch (error) {
    console.error("Error setting auto-update:", error)

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
