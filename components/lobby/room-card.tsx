"use client"

import { GameStatus, RoomStatus, type Room } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CapacityBadge } from "./capacity-badge"
import { CountdownTimer } from "../common/countdown-timer"
import { Users, DollarSign, Clock } from "lucide-react"
import i18n from "@/i18n"
import { useRouter } from "next/navigation"
import { useWebSocketEvents } from "@/lib/hooks/websockets/use-websocket-events"

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {

  const occupancyPercentage = 0;//(room.players / room.capacity) * 100
  const isNearlyFull = occupancyPercentage >= 80
  const isFull = false;//room.players >= room.capacity


  const router =  useRouter();
  // const {enterRoom} =  useWebSocketEvents({roomId: room.id, enabled: true});

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case RoomStatus.OPEN:
        return "bg-green-500"
      case RoomStatus.CLOSED:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.OPEN:
        return "Open"
      case RoomStatus.CLOSED:
        return "Closed"
      default:
        return "Unknown"
    }
  }

  const handleCardButtonClick = (room: Room) => {
    if (room.status === RoomStatus.OPEN) {
      // Navigate to room

      // enterRoom(room.id);
      router.push(`/${i18n.language}/rooms/${room.id}`);
    } else {
      // View game
      router.push(`/${i18n.language}/rooms/${room.id}`);
    }
  }

  // return (
  //   <Card className="hover:shadow-lg transition-shadow duration-200 bg-green-900">
  //     <CardHeader className="pb-3">
  //       <div className="flex items-start justify-between">
  //         <div className="space-y-1">
  //           {/* <h3 className="font-semibold text-lg leading-tight">{room.name}</h3> */}
  //           <div className="flex items-center gap-2 text-sm text-muted-foreground">
  //             {/* <DollarSign className="h-4 w-4" /> */}
  //             <span className="font-medium">${room.entryFee} entry</span>
  //           </div>
  //         </div>

  //         <Badge variant="secondary" className={`${getStatusColor(room.status)} text-white border-0`}>
  //           {getStatusText(room.status)}
  //         </Badge>
  //       </div>
  //     </CardHeader>

  //     <CardContent className="space-y-4">
  //       <div className="space-y-2">
  //         <div className="flex items-center justify-between text-sm">
  //           <div className="flex items-center gap-1">
  //             <Users className="h-4 w-4" />
  //             <span>Players</span>
  //           </div>
  //           <CapacityBadge current={0} max={room.capacity} variant={isNearlyFull ? "warning" : "default"} />
  //         </div>

  //         <Progress value={occupancyPercentage} className="h-2" />
  //       </div>

  //       {/* {room.nextStartAt && room.status !== "in-game" && (
  //         <div className="space-y-2">
  //           <div className="flex items-center gap-1 text-sm text-muted-foreground">
  //             <Clock className="h-4 w-4" />
  //             <span>Next game starts in</span>
  //           </div>
  //           <CountdownTimer targetTime={room.nextStartAt} />
  //         </div>
  //       )} */}

  //       {/* {room.status === "in-game" && (
  //         <div className="text-center py-2">
  //           <CountdownTimer
  //             targetTime={new Date(Date.now() + 180000).toISOString()} // Mock 3 min countdown
  //             label="Next game opens in"
  //           />
  //         </div>
  //       )} */}
  //     </CardContent>

  //     <CardFooter>
  //       <Button
  //         // asChild
  //         className="w-full"
  //         // disabled={isFull && room.status === "open"}
  //         variant={room.status === RoomStatus.OPEN ? "default" : "secondary"}
  //         onClick={() => handleCardButtonClick(room)}
  //       >
  //         {/* <Link href={`/${i18n.language}/rooms/${room.id}`}>
  //           {room.status == RoomStatus.OPEN ?
  //                "Enter Room"
  //             : "View Game"}
  //         </Link> */}
  //         {room.status == RoomStatus.OPEN ?
  //                "Enter Room"
  //             : "View Game"}
  //       </Button>
  //     </CardFooter>
  //   </Card>
  // )

  return (
    <Button
      className="w-36 h-36 flex flex-col items-center justify-center text-xl dark:text-white font-bold bg-green-900 hover:bg-green-800 rounded-2xl shadow-lg cursor-pointer"
      onClick={() => handleCardButtonClick(room)}
    >
      {/* <span className="text-sm">Room {room?.id}</span> */}
      <span className="text-sm">Capacity: {room?.capacity}</span>
      <span>Price: ${room.entryFee}</span>
    </Button>
)

}
