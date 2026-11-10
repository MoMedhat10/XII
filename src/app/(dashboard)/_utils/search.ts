/**
 * Prisma passes `contains` straight into ILIKE without escaping, so a search
 * for "%" or "_" would match every row. Backslash is ILIKE's default escape
 * character.
 */
export const escapeLike = (q: string) => q.replace(/[\\%_]/g, "\\$&")
