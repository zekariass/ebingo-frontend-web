import { NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/backend/types"

export async function GET() {
  try {
    // Mock balance for development
    const response: ApiResponse = {
      success: true,
      data: {
        available: 250.75,
        pending: 25.0,
        total: 275.75,
        currency: "USD",
      },
      error: null,
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
    return NextResponse.json(response, { status: 500 })
  }
}
