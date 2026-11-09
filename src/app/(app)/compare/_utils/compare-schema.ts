import { z } from "zod"

/** More columns than this and a spec table stops being readable. */
export const COMPARE_MAX = 4
export const COMPARE_MIN = 2

/**
 * `?ids=a,b,c` → valid, unique watch ids in URL order, at most 4.
 * Anything malformed is dropped; it never throws.
 */
export const compareIdsSchema = z
  .string()
  .catch("")
  .transform((raw) => {
    const ids = raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => z.uuid().safeParse(s).success)
    return [...new Set(ids)].slice(0, COMPARE_MAX)
  })

export const compareHref = (ids: string[]) =>
  ids.length
    ? `/compare?ids=${ids.slice(0, COMPARE_MAX).join(",")}`
    : "/compare"
