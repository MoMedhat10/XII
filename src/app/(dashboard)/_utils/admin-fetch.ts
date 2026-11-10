/** Shared by every admin route's queries: fetch + error shape + cache rules. */

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

/** GET a JSON admin endpoint. Non-2xx responses throw an HttpError with the server's message. */
export async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string
    } | null
    throw new HttpError(
      body?.message ?? `Request failed (${res.status})`,
      res.status
    )
  }
  return res.json() as Promise<T>
}

// Admin data goes stale quickly (other admins edit too), so these override
// the app-wide defaults in QueryProvider.
export const adminQueryDefaults = {
  staleTime: 10_000,
  refetchOnWindowFocus: true,
  // 4xx won't fix itself (signed out, not allowed, not found): fail right away
  retry: (count: number, error: Error) =>
    !(error instanceof HttpError && error.status < 500) && count < 2,
}
