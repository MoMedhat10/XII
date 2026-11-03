export type CatalogWatchImage = {
  url: string
  alt: string
}

/** One watch card, on the catalog and the home page's Curated Drop. */
export type CatalogWatch = {
  id: string
  name: string
  model: string
  brand: string
  priceCents: number
  caliber: string | null
  caseMaterial: string | null
  /** cover photo, or null when the watch has none */
  image: CatalogWatchImage | null
}

export type CatalogPage = {
  watches: CatalogWatch[]
  /** watches matching the filters */
  total: number
  /** offset of the next page, or null on the last page */
  nextOffset: number | null
}

export type CatalogBrand = {
  id: string
  name: string
  /** live watches of this brand, ignoring filters */
  count: number
}

export type CatalogFacets = {
  brands: CatalogBrand[]
  /** most expensive live watch, in cents */
  maxPriceCents: number
}

export type FavoritesState = {
  signedIn: boolean
  watchIds: string[]
}
