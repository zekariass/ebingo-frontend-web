// Core game types
export interface BingoCard {
  id: number
  numbers: number[][]
  marked: boolean[][]
}

export interface Room {
  id: string
  name: string
  fee: number
  players: number
  capacity: number
  status: "open" | "in-game" | "starting"
  nextStartAt?: string
  pattern?: BingoPattern
}

export interface Player {
  id: string
  name: string
  balance: number
  cards: BingoCard[]
}

export interface GameState {
  id: string
  roomId: string
  status: "waiting" | "active" | "finished"
  pattern: BingoPattern
  calledNumbers: number[]
  currentNumber?: number
  winners: Winner[]
  startedAt?: string
  endsAt?: string
}

export interface Winner {
  playerId: string
  playerName: string
  cardId: number
  pattern: BingoPattern
  prizeAmount: number
  winTime: string
}

export type BingoPattern = "line" | "four-corners" | "full-house" | "x-pattern"

// WebSocket event types
export interface WSMessage {
  type: string
  payload: any
  timestamp: string
}

export interface RoomSnapshot extends WSMessage {
  type: "room.snapshot"
  payload: {
    room: Room
    players: Player[]
    game?: GameState
  }
}

export interface PlayerJoined extends WSMessage {
  type: "room.playerJoined"
  payload: {
    player: Player
  }
}

export interface PlayerLeft extends WSMessage {
  type: "room.playerLeft"
  payload: {
    playerId: string
  }
}

export interface GameStarted extends WSMessage {
  type: "game.started"
  payload: {
    game: GameState
  }
}

export interface NumberCalled extends WSMessage {
  type: "game.numberCalled"
  payload: {
    number: number
    index: number
    calledAt: string
  }
}

export interface BingoClaimed extends WSMessage {
  type: "game.bingoClaimed"
  payload: {
    playerId: string
    cardId: number
    pattern: BingoPattern
    status: "pending" | "verified" | "rejected"
  }
}

export interface WinnerDeclared extends WSMessage {
  type: "game.winnerDeclared"
  payload: {
    winners: Winner[]
    endedAt: string
  }
}

export interface NextCountdown extends WSMessage {
  type: "game.nextCountdown"
  payload: {
    secondsRemaining: number
  }
}

export interface CardsAssigned extends WSMessage {
  type: "cards.assigned"
  payload: {
    cards: BingoCard[]
  }
}

export interface PaymentUpdated extends WSMessage {
  type: "payments.updated"
  payload: {
    balance: number
    transaction?: {
      id: string
      amount: number
      type: "charge" | "payout"
      status: "pending" | "completed" | "failed"
    }
  }
}

export type WSEvent =
  | RoomSnapshot
  | PlayerJoined
  | PlayerLeft
  | GameStarted
  | NumberCalled
  | BingoClaimed
  | WinnerDeclared
  | NextCountdown
  | CardsAssigned
  | PaymentUpdated

// API types
export interface CreateRoomRequest {
  name: string
  fee: number
  capacity: number
}

export interface JoinRoomRequest {
  roomId: string
  cardIds: number[]
}

export interface ChargeRequest {
  amount: number
  roomId: string
  cardIds: number[]
}

export interface BingoClaimRequest {
  roomId: string
  cardId: number
  pattern: BingoPattern
}
