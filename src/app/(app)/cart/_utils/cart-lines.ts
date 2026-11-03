import type { CartLine } from "../_data/types"

export const lineTotal = (line: CartLine) => line.priceCents * line.quantity

export const sumPieces = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.quantity, 0)

export const sumSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + lineTotal(l), 0)
