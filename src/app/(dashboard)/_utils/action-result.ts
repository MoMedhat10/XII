export type ActionRes<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string }

export const fail = (message: string) => ({ success: false as const, message })
