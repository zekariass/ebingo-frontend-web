import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session?.user || session.user.role !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const mockTransactions = [
      {
        id: "txn-1",
        playerName: "John Doe",
        type: "deposit",
        amount: 50.0,
        status: "completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleString(), // 30 minutes ago
      },
      {
        id: "txn-2",
        playerName: "Jane Smith",
        type: "withdrawal",
        amount: 25.0,
        status: "pending",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toLocaleString(), // 1 hour ago
      },
      {
        id: "txn-3",
        playerName: "Mike Johnson",
        type: "game_entry",
        amount: 10.0,
        status: "completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toLocaleString(), // 1.5 hours ago
      },
      {
        id: "txn-4",
        playerName: "Sarah Wilson",
        type: "deposit",
        amount: 100.0,
        status: "completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleString(), // 2 hours ago
      },
      {
        id: "txn-5",
        playerName: "David Brown",
        type: "game_win",
        amount: 75.0,
        status: "completed",
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toLocaleString(), // 3 hours ago
      },
    ].slice(0, limit)

    return NextResponse.json({ success: true, data: mockTransactions })
  } catch (error) {
    console.error("Admin transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
