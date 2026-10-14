export type CartItem = {
  id: string
  name: string
  ref: string
  spec: string
  price: number
  qty: number
  max: number
  image?: string
  flag?: string
}

export type CartUndo = { item: CartItem; index: number; saved: boolean }

export const usd = (n: number) => "$" + n.toLocaleString("en-US")
