import { NextResponse } from "next/server"
import { updateClock } from "@/lib/caspar/client"

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
