// Simulation layer for the admin watches UI. Nothing here touches the
// database: swap these for real queries / server actions when wiring it up.

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

/** Share of simulated requests that fail, so error toasts can be checked. */
export const SIMULATED_FAILURE_RATE = 0.1

export const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function simulateRequest<T>(
  result: T,
  { delay = 800, failureRate = SIMULATED_FAILURE_RATE } = {}
): Promise<T> {
  await wait(delay)
  if (Math.random() < failureRate) {
    throw new Error("The request couldn't be completed. Please try again.")
  }
  return result
}

export const MOCK_BRANDS: AdminBrand[] = [
  {
    id: "b1",
    name: "XII Maison",
    description: "House movements, Geneva.",
    logoUrl: null,
    watchCount:2
  },
  {
    id: "b2",
    name: "Atelier Nord",
    description: "Scandinavian tool watches.",
    logoUrl: null,
    watchCount:4
  },
  {
    id: "b3",
    name: "Halden",
    description: "Minimal dress pieces.",
    logoUrl: null,
    watchCount:2
  },
  {
    id: "b4",
    name: "Vauclair",
    description: "Independent complications.",
    logoUrl: null,
    watchCount:11
  },
  {
    id: "b5",
    name: "Orsini",
    description: "Milanese design house.",
    logoUrl: null,
    watchCount:3
  },
]

type Seed = [
  id: string,
  name: string,
  model: string,
  brandId: string,
  dollars: number,
  stock: number,
  isActive: boolean,
]

const seeds: Seed[] = [
  ["w1", "Chronograph I", "Ref. 101", "b1", 12_400, 4, true],
  ["w2", "Tourbillon II", "Ref. 207", "b1", 48_000, 1, true],
  ["w3", "Automatic III", "Ref. 312", "b2", 8_900, 9, true],
  ["w4", "Diver IV", "Ref. 410", "b2", 6_200, 0, true],
  ["w5", "Dress V", "Ref. 505", "b3", 5_400, 12, false],
  ["w6", "Moonphase VI", "Ref. 611", "b4", 21_500, 2, true],
  ["w7", "GMT VII", "Ref. 702", "b2", 9_800, 6, true],
  ["w8", "Perpetual VIII", "Ref. 808", "b4", 64_000, 1, true],
  ["w9", "Field IX", "Ref. 903", "b3", 4_200, 15, true],
  ["w10", "Skeleton X", "Ref. 1010", "b1", 31_000, 3, false],
  ["w11", "Regulateur XI", "Ref. 1104", "b5", 11_800, 5, true],
  ["w12", "Pilot XII", "Ref. 1212", "b2", 7_600, 0, true],
  ["w13", "Calendar XIII", "Ref. 1301", "b5", 14_500, 4, true],
  ["w14", "Minute Repeater", "Ref. 1499", "b1", 125_000, 1, true],
]

export const MOCK_WATCHES: AdminWatch[] = seeds.map(
  ([id, name, model, brandId, dollars, stock, isActive], index) => {
    // Newest first: each seed is a day older than the one before it.
    const createdAt = new Date(Date.UTC(2026, 9, 20 - index)).toISOString()
    return {
      id,
      name,
      model,
      brandId,
      priceCents: dollars * 100,
      stock,
      isActive,
      description: "",
      images: [],
      createdAt,
      updatedAt: createdAt,
    }
  }
)
