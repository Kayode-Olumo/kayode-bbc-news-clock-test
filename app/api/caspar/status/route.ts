import { NextResponse } from "next/server"
import { getCasparStatus } from "@/lib/caspar/client"

export async function GET() {
  try {
    const state = getCasparStatus()

    return NextResponse.json(state)
  } catch (error) {
    console.error("Error getting state:", error)

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
