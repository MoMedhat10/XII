/** URL ⇄ filters for admin list pages. Plain module: the server pages use it too. */

export type UrlFilters = { q: string; page: number } & Record<
  string,
  string | number
>

export const SEARCH_DEBOUNCE_MS = 300

/** The URL for `filters`, leaving out every value that equals its default. */
export function hrefFor<F extends Record<string, string | number>>(
  pathname: string,
  filters: F,
  defaults: F
) {
  const params = new URLSearchParams()
  for (const key of Object.keys(defaults) as (keyof F & string)[]) {
    const value = filters[key]
    if (value !== defaults[key] && value !== "") {
      params.set(key, String(value))
    }
  }
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
