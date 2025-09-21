// import { type NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session?.user || session.user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const rooms = await prisma.room.findMany({
//       include: {
//         _count: {
//           select: { gameEntries: true },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     })

//     const roomsWithPlayerCount = rooms.map((room) => ({
//       ...room,
//       players: room._count.gameEntries,
//     }))

//     return NextResponse.json({ success: true, data: roomsWithPlayerCount })
//   } catch (error) {
//     console.error("Admin rooms error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)

//     if (!session?.user || session.user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { name, fee, capacity, pattern } = await request.json()

//     if (!name || !fee || !capacity || !pattern) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
//     }

//     const room = await prisma.room.create({
//       data: {
//         name,
//         fee: Number.parseFloat(fee),
//         capacity: Number.parseInt(capacity),
//         pattern,
//       },
//     })

//     return NextResponse.json({ success: true, data: room })
//   } catch (error) {
//     console.error("Create room error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }



import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL!;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: check role if stored in user_metadata
    // if (session.user.user_metadata.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Call backend API to fetch rooms
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/rooms`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result?.error || "Backend error" }, { status: response.status });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("Admin rooms error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // if (session.user.user_metadata.role !== "admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { name, entryFee, capacity, minPlayers, pattern } = await request.json();

    if (!name || !entryFee || !capacity || !minPlayers || !pattern) {
      return NextResponse.json({ error: "Missing required fields or invalid field name" }, { status: 400 });
    }

    // Call backend API to create room
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/secured/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        name,
        entryFee: Number(entryFee),
        capacity: Number(capacity),
        minPlayers: Number(minPlayers),
        pattern
      }),
    });

    const data = await response.json();

    console.log("================================>>>: CREATING ROOM: "+ JSON.stringify(data))

    if (!response.ok) {
      return NextResponse.json({ error: data?.error || "Backend error" }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Create room error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
