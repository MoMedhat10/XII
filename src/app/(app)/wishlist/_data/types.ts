export type WishlistItem = {
  /** the watch id; actions and selection key on it */
  id: string
  name: string
  model: string
  brand: string
  priceCents: number
  /** inactive watches never reach the page, so available = stock > 0 */
  stock: number
  /** cover image only */
  image: { url: string; alt: string } | null
  /** "2 days ago", computed on the server */
  savedLabel: string
  inBag: boolean
}

export type WishlistPage = {
  items: WishlistItem[]
  /** all saved active watches, not just the ones shown */
  count: number
  totalValueCents: number
  /** `?show=` value for the next step, or null when everything is shown */
  nextShow: number | null
}
