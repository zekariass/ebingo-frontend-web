import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rooms = await prisma.room.findMany({
      include: {
        _count: {
          select: { gameEntries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const roomsWithPlayerCount = rooms.map((room) => ({
      ...room,
      players: room._count.gameEntries,
    }))

    return NextResponse.json({ success: true, data: roomsWithPlayerCount })
  } catch (error) {
    console.error("Admin rooms error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, fee, capacity, pattern } = await request.json()

    if (!name || !fee || !capacity || !pattern) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const room = await prisma.room.create({
      data: {
        name,
        fee: Number.parseFloat(fee),
        capacity: Number.parseInt(capacity),
        pattern,
      },
    })

    return NextResponse.json({ success: true, data: room })
  } catch (error) {
    console.error("Create room error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
