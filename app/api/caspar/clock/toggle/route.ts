import { NextResponse } from "next/server"
import { toggleOverlay } from "@/lib/caspar/client"

export async function POST(request: Request) {
  try {
    const { visible } = await request.json()

    if (typeof visible !== "boolean") {
      return NextResponse.json({ error: "Invalid request: 'visible' must be a boolean" }, { status: 400 })
    }

    const success = await toggleOverlay(visible)

    if (!success) {
      return NextResponse.json({ error: "Failed to set overlay visibility" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      visible,
    })
  } catch (error) {
    console.error("Error setting overlay visibility:", error)

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
