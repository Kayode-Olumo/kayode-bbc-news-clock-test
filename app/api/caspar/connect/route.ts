/**
 * Caspar CG Connection API Route
 * 
 * This route handles the initial connection to the Caspar CG server. It provides
 * a POST endpoint that attempts to establish a connection and returns the connection
 * status and any relevant messages.
 * 
 * The route is used by the main application to:
 * 1. Initialize the connection to Caspar CG
 * 2. Verify server availability
 * 3. Handle connection errors gracefully
 * 
 * @returns {Object} JSON response containing:
 *   - connected: boolean indicating connection status
 *   - message: string with status or error information
 */

import { NextResponse } from "next/server"
import { connectToCaspar } from "@/lib/caspar/client"

/**
 * POST handler for establishing connection to Caspar CG
 * Attempts to connect and returns the result
 */
export async function POST() {
  try {
    const result = await connectToCaspar()

    return NextResponse.json({
      connected: result.connected,
      message: result.message,
    })
  } catch (error) {
    console.error("Error initializing connection:", error)

    return NextResponse.json(
      {
        connected: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
