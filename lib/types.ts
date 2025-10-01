export interface UserProfile {
  id: number;
  supabaseId: string;
  firstName: string;
  lastName: string;
  nickName?: string | null;
  email: string;
  phone?: string | null;
  balance: Big;
  status: 'ACTIVE' | 'BANNED';
  role: 'ADMIN' | 'PLAYER';
  freePlayCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
  path?: string;
  data?: T;
  timestamp?: string;
};



export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
export type TransactionStatus = "PENDING" | "AWAITING_APPROVAL" | "COMPLETED" | "FAILED";

export interface Transaction {
  id: number;
  userProfileId: number;
  transferTo?: number | null;
  paymentMethodId: number;
  txnType: TransactionType;
  txnAmount: number;
  status: TransactionStatus;
  description?: string;
  createdAt: string
}

export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
}

export interface WalletBalance {
  id: number;
  userProfileId: number;
  totalDeposit: number;
  depositBalance: number;
  pendingBalance: number;
  welcomeBonus: number;
  availableWelcomeBonus: number;
  referralBonus: number;
  availableReferralBonus: number;
  totalPrizeAmount: number;
  pendingWithdrawal: number;
  totalWithdrawal: number;
  totalAvailableBalance: number;
  availableToWithdraw: number;
}

export interface DepositRequest {
  amount: number
  paymentMethodId: string
}

export interface WithdrawalRequest {
  amount: number
  paymentMethodId: string
}

export interface PaymentProcessingResult {
  success: boolean
  transactionId?: string
  error?: string
  requiresVerification?: boolean
}


// Core game types
export enum BingoColumn {
  B = "B",
  I = "I",
  N = "N",
  G = "G",
  O = "O",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "BANNED",
  // add other statuses as needed
}

export enum UserRole {
  USPLAYERER = "PLAYER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  // add other roles as needed
}

export interface CardInfo {
  cardId: string;
  numbers: Partial<Record<BingoColumn, number[]>>;
  marked: number[];
}

export enum GameStatus {
  READY = "READY",
  COUNTDOWN = "COUNTDOWN",
  PLAYING = "PLAYING",
  COMPLETED = "COMPLETED",
  CANCELLED_ADMIN = "CANCELLED_ADMIN",
  CANCELLED_NO_MIN_PLAYERS = "CANCELLED_NO_MIN_PLAYERS",
}

export enum GamePattern {
  LINE = "LINE",
  LINE_AND_CORNERS = "LINE_AND_CORNERS",
  CORNERS = "CORNERS",
  FULL_HOUSE = "FULL_HOUSE",
}

export enum RoomStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export interface GameWinner {
  gameId: number,
  playerId: string
  playerName: string
  cardId: string
  pattern: GamePattern
  prizeAmount: number
  winAt: string
  hasWinner: boolean
}

export interface GameState {
  gameId: number;
  roomId: number;

  // Players in the game
  joinedPlayers: string[];

  // Total number of players in the game
  playersCount: number;

  // Numbers that have been drawn in the game (order matters)
  drawnNumbers: number[];

  // The most recently drawn number
  currentDrawnNumber?: number;

  // Users disqualified due to false bingo claims
  disqualifiedUsers: number[];

  // Track if the user playing the game is disqualified
  amIDisqualified: boolean;

  // Card Pools
  currentCardPool: CardInfo[];

  // Selected cards by players
  allSelectedCardsIds: string[]; 

  // User selected card IDs
  userSelectedCardsIds: string[];

  // Marked numbers go here
  userSelectedCards: CardInfo[];

  // All card IDs in the game (for reference)
  allCardIds: string[];

  // Game status flags
  started: boolean;
  ended: boolean;
  status: GameStatus;

  // Countdown timer in seconds (if applicable)
  countdown: number;

  // Stop flag for number drawing
  stopNumberDrawing: boolean;

}


export interface PlayerState {
  userProfileId: number;

  // Map of cardId -> CardInfo
  cards: Record<string, CardInfo>;
}


export interface Wallet {
  id: number;
  userProfileId: number;

  totalDeposit: number;
  depositBalance: number;
  pendingBalance: number;
  welcomeBonus: number;
  availableWelcomeBonus: number;
  referralBonus: number;
  availableReferralBonus: number;
  totalPrizeAmount: number;
  pendingWithdrawal: number;
  totalWithdrawal: number;
  totalAvailableBalance: number;
  availableToWithdraw: number;

  createdAt: string; // ISO string from Instant
  updatedAt: string; // ISO string from Instant
}

export interface UserProfileDto {
  id: number;
  supabaseId: string; // UUID as string
  firstName: string;
  lastName: string;
  nickName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string; // LocalDate -> ISO string (YYYY-MM-DD)
  status: UserStatus;
  role: UserRole;
  dailyFreePlayCount?: number;
  wallet?: Wallet;
  createdAt: string; // LocalDateTime -> ISO string
  updatedAt: string; // LocalDateTime -> ISO string
}


export interface Room {
  id: number;
  name: string;
  capacity: number;
  minPlayers: number;
  entryFee: number; // BigDecimal → number
  pattern: GamePattern;
  status: RoomStatus;
  isForPractice?: boolean;
}


// ============ WebSocket event types ======================
export interface WSMessage {
  type: string
  payload: any
}

export type WSPayload = WSMessage["payload"]

export interface PlayerJoinRequest extends WSMessage {
  type: "game.playerJoinRequest"
  payload: {
    gameId: number
    playerId: number
  }
}

export interface PlayerJoinResponse extends WSMessage {
  type: "game.playerJoinResponse"
  payload: {
    success: boolean
    error: string | null
    gameId: number
    playerId: number | null
  }
}


export interface PlayerJoined extends WSMessage {
  type: "game.playerJoined"
  payload: {
    gameId: number
    playerId: string
    playersCount: number
    joinedPlayers: string[]
  }
}


export interface PlayerLeaveRequest extends WSMessage {
  type: "game.playerLeaveRequest"
  payload: {
    gameId: number
    playerId: string
  }
}

export interface PlayerLeaveResponse extends WSMessage {
  type: "game.playerLeaveResponse"
  payload: {
    success: boolean
    error: string | null
    gameId: number
    playerId: string
  }
}


export interface PlayerLeft extends WSMessage {
  type: "game.playerLeft"
  payload: {
    gameId: number
    playerId: string
    playersCount: number
    joinedPlayers: string[]
  }
}


export interface RoomEnter extends WSMessage {
  type: "room.enter"
  payload: {
    roomId: number
    playerId: number
  }
}


export interface RoomLeave extends WSMessage {
  type: "room.leave"
  payload: {
    roomId: number
    playerId: number
  }
}

export interface ServerGameState extends WSMessage {
  type: "room.serverGameState"
  payload: {
    success: boolean
    error: string
    gameState: GameState | null,
    roomId: number
  }
}

export interface CardSelectRequest extends WSMessage {
  type: "game.cardSelectRequest"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}


export interface CardSelectResponse extends WSMessage {
  type: "game.cardSelectResponse"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}

export interface CardSelected extends WSMessage {
  type: "game.cardSelected"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}


export interface CardReleaseRequest extends WSMessage {
  type: "game.cardReleaseRequest"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}

export interface CardReleaseResponse extends WSMessage {
  type: "game.cardReleaseResponse"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}

export interface CardReleased extends WSMessage {
  type: "game.cardReleased"
  payload: {
    gameId: string
    playerId: string
    cardId: string
  }
}


export interface MarkNumberRequest extends WSMessage {
  type: "card.markNumberRequest"
  payload: {
    gameId: string
    playerId: string
    cardId: string
    number: number
  }
}


export interface MarkNumberResponse extends WSMessage {
  type: "card.markNumberResponse"
  payload: {
    gameId?: string
    playerId?: string
    cardId: string
    numbers: number[]
  }
}


export interface UnmarkNumberRequest extends WSMessage {
  type: "card.unmarkNumberRequest"
  payload: {
    gameId: string
    playerId: string
    cardId: string
    number: number
  }
}

export interface UnmarkNumberResponse extends WSMessage {
  type: "card.unmarkNumberResponse"
  payload: {
    gameId?: number
    playerId?: number
    cardId: string
    numbers: number[]
  }
}


export interface GameStarted extends WSMessage {
  type: "game.started"
  payload: {
    startedAt: string
    started: boolean
    status: GameStatus
  }
}

export interface NumberDrawn extends WSMessage {
  type: "game.numberDrawn"
  payload: {
    gameId: number
    number: number
    column?: BingoColumn
  }
}

export interface BingoClaimRequest extends WSMessage {
  type: "game.bingoClaimRequest"
  payload: {
    playerId: number
    cardId: number
    pattern: GamePattern
    markedNumbers: number[]
  }
}


export interface BingoClaimResponse extends WSMessage {
  type: "game.bingoClaimResponse"
  payload: {
    success: boolean
    error: string | null
    playerId: number
    cardId: number
    pattern: GamePattern
    markedNumbers: number[]
  }
}

export interface WinnerDeclared extends WSMessage {
  type: "game.winnerDeclared"
  payload: {
    winner: GameWinner
    endedAt: string
  }
}

export interface Countdown extends WSMessage {
  type: "game.countdown"
  payload: {
    gameId: number
    seconds: number
  }
}


export interface GameEnded extends WSMessage {
  type: "game.ended"
  payload: GameWinner
}


export interface ErrorMessage extends WSMessage {
  type: "error"
  payload: {
    code?: number
    message: string
  }
}


export interface PongMessage extends WSMessage {
  type: "pong"
  payload: any
}



export type WSRequestEvent = 
  | PlayerJoinRequest
  | PlayerLeaveRequest
  | RoomEnter
  | CardSelectRequest
  | CardReleaseRequest
  | MarkNumberRequest
  | UnmarkNumberRequest
  | BingoClaimRequest
  | RoomLeave

export type WSResponseEvent = 
  | PlayerJoinResponse
  | PlayerLeaveResponse
  | ServerGameState
  | CardSelectResponse
  | CardReleaseResponse
  | MarkNumberResponse
  | UnmarkNumberResponse
  | BingoClaimResponse
  | ErrorMessage
  | GameStarted
  | PlayerJoined
  | PlayerLeft
  | CardSelected
  | CardReleased
  | NumberDrawn
  | WinnerDeclared
  | Countdown
  | GameEnded


export type WSEvent = WSRequestEvent | WSResponseEvent | PongMessage




// ========================OLD TYPES========================
// export interface BingoCard {
//   id: string
//   numbers: number[][]
//   marked: boolean[][]
// }

// export interface Room {
//   id: string
//   name: string
//   fee: number
//   players: number
//   capacity: number
//   status: "open" | "in-game" | "starting"
//   nextStartAt?: string
//   pattern?: BingoPattern
// }

// export interface Player {
//   id: string
//   name: string
//   balance: number
//   cards: BingoCard[]
// }

// export interface GameState {
//   id: string
//   roomId: string
//   status: "waiting" | "active" | "finished"
//   pattern: BingoPattern
//   calledNumbers: number[]
//   currentNumber?: number
//   winners: Winner[]
//   startedAt?: string
//   endsAt?: string
// }

// export interface Winner {
//   playerId: string
//   playerName: string
//   cardId: number
//   pattern: BingoPattern
//   prizeAmount: number
//   winTime: string
// }

// export type BingoPattern = "line" | "four-corners" | "full-house" | "x-pattern"

// // WebSocket event types
// export interface WSMessage {
//   type: string
//   payload: any
//   timestamp: string
// }

// export interface RoomSnapshot extends WSMessage {
//   type: "room.snapshot"
//   payload: {
//     room: Room
//     players: Player[]
//     game?: GameState
//   }
// }

// export interface PlayerJoined extends WSMessage {
//   type: "room.playerJoined"
//   payload: {
//     player: Player
//   }
// }

// export interface PlayerLeft extends WSMessage {
//   type: "room.playerLeft"
//   payload: {
//     playerId: string
//   }
// }

// export interface GameStarted extends WSMessage {
//   type: "game.started"
//   payload: {
//     game: GameState
//   }
// }

// export interface NumberCalled extends WSMessage {
//   type: "game.numberCalled"
//   payload: {
//     number: number
//     index: number
//     calledAt: string
//   }
// }

// export interface BingoClaimed extends WSMessage {
//   type: "game.bingoClaimed"
//   payload: {
//     playerId: string
//     cardId: number
//     pattern: BingoPattern
//     status: "pending" | "verified" | "rejected"
//   }
// }

// export interface WinnerDeclared extends WSMessage {
//   type: "game.winnerDeclared"
//   payload: {
//     winners: Winner[]
//     endedAt: string
//   }
// }

// export interface NextCountdown extends WSMessage {
//   type: "game.nextCountdown"
//   payload: {
//     secondsRemaining: number
//   }
// }

// export interface CardsAssigned extends WSMessage {
//   type: "cards.assigned"
//   payload: {
//     cards: BingoCard[]
//   }
// }

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

// export type WSEvent =
//   | RoomSnapshot
//   | PlayerJoined
//   | PlayerLeft
//   | GameStarted
//   | NumberCalled
//   | BingoClaimed
//   | WinnerDeclared
//   | NextCountdown
//   | CardsAssigned
//   | PaymentUpdated

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
  pattern: GamePattern
}
