export type CartImage = { url: string; alt: string } | null

export type CartLine = {
  /** the watch id; actions key on it */
  id: string
  name: string
  /** shown as the reference line */
  model: string
  /** "Rolex · Automatic · Oystersteel", blanks skipped */
  spec: string
  /** live Watch.priceCents; orders snapshot prices, the bag doesn't */
  priceCents: number
  /** already clamped to `max` */
  quantity: number
  /** min(stock, CART_MAX_PER_PIECE) */
  max: number
  flag: string | null
  /** cover image only */
  image: CartImage
}

/** A saved watch suggested on the empty bag. */
export type CartPick = {
  id: string
  name: string
  priceCents: number
  image: CartImage
}

export type CartPage = {
  lines: CartLine[]
  /** only filled when the bag is empty */
  picks: CartPick[]
}
