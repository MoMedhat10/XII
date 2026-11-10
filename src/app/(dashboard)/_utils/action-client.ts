import type { ActionRes, FieldErrors } from "./action-result"

// Server actions return { success: false } instead of throwing. TanStack only
// knows a mutation failed when mutationFn throws, so unwrap() turns one into
// the other.

export class ActionFailure extends Error {
  constructor(
    message: string,
    readonly fieldErrors?: FieldErrors
  ) {
    super(message)
  }
}

export function unwrap<T>(res: ActionRes<T>) {
  if (!res.success) throw new ActionFailure(res.message, res.fieldErrors)
  return res
}

/** A failed save: shown under the matching fields, otherwise as a toast. */
export type ServerError = { message: string; fieldErrors?: FieldErrors }

/** A mutation's error in the shape the forms show (field errors or a toast). */
export const toServerError = (error: Error | null): ServerError | undefined =>
  error
    ? {
        message: error.message,
        fieldErrors:
          error instanceof ActionFailure ? error.fieldErrors : undefined,
      }
    : undefined

export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback
