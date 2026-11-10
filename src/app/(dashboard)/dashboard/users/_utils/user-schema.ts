import { z } from "zod"

export const USER_ROLES = ["all", "customer", "admin"] as const
export const USER_STATUSES = [
  "all",
  "verified",
  "unverified",
  "suspended",
] as const
export const USER_SORTS = ["newest", "oldest", "orders"] as const

export type UserRoleFilter = (typeof USER_ROLES)[number]
export type UserStatusFilter = (typeof USER_STATUSES)[number]
export type UserSort = (typeof USER_SORTS)[number]

export const USERS_PAGE_SIZE = 10

/** Every field falls back to its default, so any URL parses. */
export const userFiltersSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  role: z.enum(USER_ROLES).catch("all"),
  status: z.enum(USER_STATUSES).catch("all"),
  sort: z.enum(USER_SORTS).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
})

export type UserFilters = z.infer<typeof userFiltersSchema>

export const DEFAULT_USER_FILTERS: UserFilters = {
  q: "",
  role: "all",
  status: "all",
  sort: "newest",
  page: 1,
}

export const userIdSchema = z.object({ id: z.uuid() })
export const setSuspendedSchema = z.object({
  id: z.uuid(),
  suspended: z.boolean(),
})

export type UserIdInput = z.infer<typeof userIdSchema>
export type SetSuspendedInput = z.infer<typeof setSuspendedSchema>
