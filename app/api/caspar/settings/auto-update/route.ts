import { NextResponse } from "next/server"
import { setAutoUpdate } from "@/lib/caspar/client"

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json()

    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Invalid request: 'enabled' must be a boolean" }, { status: 400 })
    }

    const success = await setAutoUpdate(enabled)

    return NextResponse.json({
      success: true,
      autoUpdateEnabled: enabled,
    })
  } catch (error) {
    console.error("Error setting auto-update:", error)

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
