export type AdminBrand = {
  id: string
  name: string
  description: string
  logoUrl: string | null
  watchCount: number
}

export type AdminWatchImage = {
  id: string
  url: string
  alt: string
  /** 0–100 while uploading, 100 once stored. */
  progress: number
}

export type AdminWatch = {
  id: string
  name: string
  model: string
  description: string
  priceCents: number
  stock: number
  isActive: boolean
  brandId: string
  images: AdminWatchImage[]
  createdAt: string
  updatedAt: string
}

export type AdminWatchPage = {
  watches: AdminWatch[]
  /** watches matching the filters */
  total: number
  /** all watches, ignoring filters */
  inventoryTotal: number
  /** 1-based, clamped to 1…pageCount */
  page: number
  pageCount: number
  pageSize: number
}
