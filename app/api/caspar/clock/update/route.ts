/**
 * Clock Update API Route
 * 
 * This route handles the updating of the clock display in Caspar CG. It provides
 * a POST endpoint that triggers an update of the current time display.
 * 
 * The route is responsible for:
 * 1. Sending the current time to Caspar CG
 * 2. Handling success/failure of the update operation
 * 3. Providing appropriate error responses
 * 
 * @returns {Object} JSON response containing:
 *   - success: boolean indicating if the update was successful
 *   - time: string with the current time (on success)
 *   - error: string with error message (on failure)
 */

import { NextResponse } from "next/server"
import { updateClock } from "@/lib/caspar/client"

/**
 * POST handler for updating the clock display
 * Attempts to update the clock and returns the result
 */
export async function POST() {
  try {
    const result = await updateClock()

    if (!result.success) {
      return NextResponse.json({ error: "Failed to update clock" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      time: result.time,
    })
  } catch (error) {
    console.error("Error updating clock:", error)

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
