import { z } from "zod"

export const CATALOG_PAGE_SIZE = 12
/** Price slider step, in whole dollars. */
export const PRICE_STEP = 500

export const CATALOG_SORTS = ["new", "asc", "desc", "az"] as const
export type CatalogSort = (typeof CATALOG_SORTS)[number]

export const SORT_LABELS: Record<CatalogSort, string> = {
  new: "Newest",
  asc: "Price ↑",
  desc: "Price ↓",
  az: "Name A–Z",
}

// Prices are whole dollars here (the slider's unit); the data layer converts
// them to cents. A missing bound means "no limit".
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  brand: z.array(z.uuid()).max(50).default([]),
  min: z.coerce.number().int().min(0).optional(),
  max: z.coerce.number().int().min(0).optional(),
  sort: z.enum(CATALOG_SORTS).default("new"),
  offset: z.coerce.number().int().min(0).default(0),
})

export type CatalogQuery = z.infer<typeof catalogQuerySchema>
export type CatalogFilters = Omit<CatalogQuery, "offset">

export function parseCatalogParams(params: URLSearchParams) {
  return catalogQuerySchema.safeParse({
    q: params.get("q") ?? undefined,
    brand: params.getAll("brand"),
    min: params.get("min") ?? undefined,
    max: params.get("max") ?? undefined,
    sort: params.get("sort") ?? undefined,
    offset: params.get("offset") ?? undefined,
  })
}

export function toCatalogParams(filters: CatalogFilters, offset: number) {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  for (const id of filters.brand) params.append("brand", id)
  if (filters.min !== undefined) params.set("min", String(filters.min))
  if (filters.max !== undefined) params.set("max", String(filters.max))
  if (filters.sort !== "new") params.set("sort", filters.sort)
  if (offset) params.set("offset", String(offset))
  return params
}

// ---------------------------------------------------------------------------
// Browser URL (/watches?…). Lenient on purpose: a hand-edited or stale link
// drops the bad values instead of breaking the page.

/** Most "load more" pages a link can restore. */
export const MAX_RESTORE_PAGES = 10
/** Slider ceiling until the facets load, and when the catalog is empty. */
export const DEFAULT_PRICE_MAX = 50_000
export const FILTER_DEBOUNCE_MS = 300

/** Slider ceiling in whole dollars: the priciest watch, rounded up a step. */
export function priceCeiling(maxPriceCents: number | undefined) {
  const dollars = Math.ceil((maxPriceCents ?? 0) / 100)
  if (!dollars) return DEFAULT_PRICE_MAX
  return Math.max(PRICE_STEP, Math.ceil(dollars / PRICE_STEP) * PRICE_STEP)
}

const isUuid = (value: string) => z.uuid().safeParse(value).success

/** A positive price snapped to the slider step; anything else means "no bound". */
const urlPrice = z.coerce
  .number()
  .int()
  .catch(0)
  .transform((v) =>
    v > 0
      ? Math.max(PRICE_STEP, Math.round(v / PRICE_STEP) * PRICE_STEP)
      : undefined
  )

const catalogUrlSchema = z.object({
  q: z
    .string()
    .catch("")
    .transform((s) => s.trim().slice(0, 100)),
  brand: z
    .array(z.string())
    .catch([])
    .transform((ids) => [...new Set(ids.filter(isUuid))].slice(0, 50)),
  min: urlPrice,
  max: urlPrice,
  sort: z.enum(CATALOG_SORTS).catch("new"),
  pages: z.coerce
    .number()
    .int()
    .catch(1)
    .transform((n) => Math.min(Math.max(n, 1), MAX_RESTORE_PAGES)),
})

export type CatalogUrlState = CatalogFilters & { pages: number }

type ReadableParams = Pick<URLSearchParams, "get" | "getAll">

export function parseCatalogUrl(params: ReadableParams): CatalogUrlState {
  const state = catalogUrlSchema.parse({
    q: params.get("q") ?? "",
    brand: params.getAll("brand"),
    min: params.get("min") ?? undefined,
    max: params.get("max") ?? undefined,
    sort: params.get("sort") ?? undefined,
    pages: params.get("pages") ?? undefined,
  })
  // an inverted range can't match anything: keep the lower bound only
  if (
    state.min !== undefined &&
    state.max !== undefined &&
    state.max <= state.min
  ) {
    state.max = undefined
  }
  return state
}

export function catalogHref(
  pathname: string,
  filters: CatalogFilters,
  pages: number
) {
  const params = toCatalogParams(filters, 0)
  if (pages > 1) params.set("pages", String(pages))
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export const favoriteSchema = z.object({
  watchId: z.uuid(),
  saved: z.boolean(),
})
export type FavoriteInput = z.infer<typeof favoriteSchema>
