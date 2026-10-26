import type { z } from "zod"

/** First validation message per top-level field. */
export type FieldErrors = Partial<Record<string, string>>

export type ActionRes<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; fieldErrors?: FieldErrors }

export const fail = (message: string) => ({ success: false as const, message })

/** A failed safeParse: the first message overall plus one per field. */
export function parseFail(error: z.ZodError) {
  const fieldErrors: FieldErrors = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "")
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message
  }
  return {
    success: false as const,
    message: error.issues[0]?.message ?? "Invalid input.",
    fieldErrors,
  }
}
