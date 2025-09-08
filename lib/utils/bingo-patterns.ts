import type { BingoCard, BingoPattern } from "@/lib/types"

export interface PatternDefinition {
  name: string
  description: string
  positions: [number, number][] // [row, col] positions that must be marked
  visualPattern: boolean[][] // 5x5 grid showing the pattern
}

// Define all bingo patterns
export const BINGO_PATTERNS: Record<BingoPattern | string, PatternDefinition> = {
  line: {
    name: "Any Line",
    description: "Complete any horizontal, vertical, or diagonal line",
    positions: [], // Dynamic - any complete line
    visualPattern: [
      [true, true, true, true, true],
      [true, true, false, false, false],
      [true, false, true, false, false],
      [true, false, false, true, false],
      [true, false, false, false, true],
    ],
  },
  "four-corners": {
    name: "Four Corners",
    description: "Mark all four corner squares",
    positions: [
      [0, 0],
      [0, 4],
      [4, 0],
      [4, 4],
    ],
    visualPattern: [
      [true, false, false, false, true],
      [false, false, false, false, false],
      [false, false, true, false, false],
      [false, false, false, false, false],
      [true, false, false, false, true],
    ],
  },
  "full-house": {
    name: "Full House",
    description: "Mark every square on the card",
    positions: [], // All positions
    visualPattern: [
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
      [true, true, true, true, true],
    ],
  },
  "x-pattern": {
    name: "X Pattern",
    description: "Mark both diagonal lines to form an X",
    positions: [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [0, 4],
      [1, 3],
      [3, 1],
      [4, 0],
    ],
    visualPattern: [
      [true, false, false, false, true],
      [false, true, false, true, false],
      [false, false, true, false, false],
      [false, true, false, true, false],
      [true, false, false, false, true],
    ],
  },
  "plus-pattern": {
    name: "Plus Sign",
    description: "Mark the middle row and middle column",
    positions: [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [0, 2],
      [1, 2],
      [3, 2],
      [4, 2],
    ],
    visualPattern: [
      [false, false, true, false, false],
      [false, false, true, false, false],
      [true, true, true, true, true],
      [false, false, true, false, false],
      [false, false, true, false, false],
    ],
  },
  "letter-t": {
    name: "Letter T",
    description: "Mark the top row and middle column",
    positions: [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
    ],
    visualPattern: [
      [true, true, true, true, true],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
      [false, false, true, false, false],
    ],
  },
  "letter-l": {
    name: "Letter L",
    description: "Mark the left column and bottom row",
    positions: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
      [4, 4],
    ],
    visualPattern: [
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, false, false, false, false],
      [true, true, true, true, true],
    ],
  },
  diamond: {
    name: "Diamond",
    description: "Mark a diamond shape in the center",
    positions: [
      [0, 2],
      [1, 1],
      [1, 3],
      [2, 0],
      [2, 2],
      [2, 4],
      [3, 1],
      [3, 3],
      [4, 2],
    ],
    visualPattern: [
      [false, false, true, false, false],
      [false, true, false, true, false],
      [true, false, true, false, true],
      [false, true, false, true, false],
      [false, false, true, false, false],
    ],
  },
}

// Enhanced pattern checking with multiple pattern support
export function checkWinningPattern(card: BingoCard, pattern: BingoPattern | string): boolean {
  const { marked } = card

  switch (pattern) {
    case "line":
      return checkAnyLine(marked)
    case "four-corners":
      return checkFourCorners(marked)
    case "full-house":
      return checkFullHouse(marked)
    case "x-pattern":
      return checkXPattern(marked)
    case "plus-pattern":
      return checkPlusPattern(marked)
    case "letter-t":
      return checkLetterT(marked)
    case "letter-l":
      return checkLetterL(marked)
    case "diamond":
      return checkDiamond(marked)
    default:
      return false
  }
}

// Check if any line (row, column, or diagonal) is complete
function checkAnyLine(marked: boolean[][]): boolean {
  // Check rows
  for (let row = 0; row < 5; row++) {
    if (marked[row].every((cell) => cell)) return true
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    if (marked.every((row) => row[col])) return true
  }

  // Check main diagonal (top-left to bottom-right)
  if (marked.every((row, i) => row[i])) return true

  // Check anti-diagonal (top-right to bottom-left)
  if (marked.every((row, i) => row[4 - i])) return true

  return false
}

function checkFourCorners(marked: boolean[][]): boolean {
  return marked[0][0] && marked[0][4] && marked[4][0] && marked[4][4]
}

function checkFullHouse(marked: boolean[][]): boolean {
  return marked.every((row) => row.every((cell) => cell))
}

function checkXPattern(marked: boolean[][]): boolean {
  const positions = BINGO_PATTERNS["x-pattern"].positions
  return positions.every(([row, col]) => marked[row][col])
}

function checkPlusPattern(marked: boolean[][]): boolean {
  const positions = BINGO_PATTERNS["plus-pattern"].positions
  return positions.every(([row, col]) => marked[row][col])
}

function checkLetterT(marked: boolean[][]): boolean {
  const positions = BINGO_PATTERNS["letter-t"].positions
  return positions.every(([row, col]) => marked[row][col])
}

function checkLetterL(marked: boolean[][]): boolean {
  const positions = BINGO_PATTERNS["letter-l"].positions
  return positions.every(([row, col]) => marked[row][col])
}

function checkDiamond(marked: boolean[][]): boolean {
  const positions = BINGO_PATTERNS["diamond"].positions
  return positions.every(([row, col]) => marked[row][col])
}

// Get all winning patterns on a card
export function getWinningPatterns(card: BingoCard): (BingoPattern | string)[] {
  const patterns = Object.keys(BINGO_PATTERNS) as (BingoPattern | string)[]
  return patterns.filter((pattern) => checkWinningPattern(card, pattern))
}

// Calculate pattern completion percentage
export function getPatternCompletion(card: BingoCard, pattern: BingoPattern | string): number {
  const patternDef = BINGO_PATTERNS[pattern]
  if (!patternDef) return 0

  if (pattern === "line") {
    // For line pattern, check the best line completion
    let maxCompletion = 0

    // Check rows
    for (let row = 0; row < 5; row++) {
      const completion = card.marked[row].filter(Boolean).length / 5
      maxCompletion = Math.max(maxCompletion, completion)
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      const completion = card.marked.filter((row) => row[col]).length / 5
      maxCompletion = Math.max(maxCompletion, completion)
    }

    // Check diagonals
    const mainDiagCompletion = card.marked.filter((row, i) => row[i]).length / 5
    const antiDiagCompletion = card.marked.filter((row, i) => row[4 - i]).length / 5

    maxCompletion = Math.max(maxCompletion, mainDiagCompletion, antiDiagCompletion)
    return maxCompletion
  }

  if (pattern === "full-house") {
    const totalCells = 25
    const markedCells = card.marked.flat().filter(Boolean).length
    return markedCells / totalCells
  }

  // For specific patterns, check required positions
  const requiredPositions = patternDef.positions
  if (requiredPositions.length === 0) return 0

  const markedRequired = requiredPositions.filter(([row, col]) => card.marked[row][col]).length
  return markedRequired / requiredPositions.length
}

// Highlight pattern positions on a card
export function getPatternHighlight(pattern: BingoPattern | string): boolean[][] {
  const patternDef = BINGO_PATTERNS[pattern]
  return (
    patternDef?.visualPattern ||
    Array(5)
      .fill(null)
      .map(() => Array(5).fill(false))
  )
}

export function checkBingoPatterns(markedCells: string[], patterns: string[]): string[] {
  const winningPatterns: string[] = []

  // Convert marked cells from string format "row-col" to boolean grid
  const marked: boolean[][] = Array(5)
    .fill(null)
    .map(() => Array(5).fill(false))

  markedCells.forEach((cellKey) => {
    const [row, col] = cellKey.split("-").map(Number)
    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      marked[row][col] = true
    }
  })

  // Create a mock card object for pattern checking
  const mockCard: BingoCard = {
    id: 0,
    numbers: Array(5)
      .fill(null)
      .map(() => Array(5).fill(0)),
    marked,
  }

  // Check each requested pattern
  patterns.forEach((pattern) => {
    if (checkWinningPattern(mockCard, pattern)) {
      winningPatterns.push(pattern)
    }
  })

  return winningPatterns
}
