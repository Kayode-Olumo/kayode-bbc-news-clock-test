import { NextResponse } from "next/server"
import { connectToCaspar } from "@/lib/caspar/client"

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
