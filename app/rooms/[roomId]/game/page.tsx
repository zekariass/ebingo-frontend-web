import { GameView } from "@/components/game/game-view"

interface GamePageProps {
  params: {
    roomId: string
  }
}

export default function GamePage({ params }: GamePageProps) {
  return <GameView roomId={params.roomId} />
}
