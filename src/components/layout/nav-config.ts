"use client"

import { useEffect, useState } from "react"

/** What the header knows about the signed-in customer (plain props only). */
export type HeaderUser = {
  username: string
  isAdmin: boolean
  /** distinct watches in the bag */
  bagCount: number
}

export type NavLink = {
  label: string
  href: string
  /** set for links to a section of the home page */
  section?: string
}

export const navLinks: NavLink[] = [
  { label: "Timepieces", href: "/watches" },
  { label: "Compare", href: "/compare" },
  { label: "Finder", href: "/#advisor", section: "advisor" },
  { label: "About", href: "/#craft", section: "craft" },
]

const sections = navLinks.flatMap((link) =>
  link.section ? [link.section] : []
)

/** Route links match their path and anything under it (/watches/<id>). */
const matchesPath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

export function isLinkActive(
  link: NavLink,
  pathname: string,
  activeSection: string | null
) {
  if (link.section) return pathname === "/" && activeSection === link.section
  return matchesPath(pathname, link.href)
}

export const isPathActive = matchesPath

// Sticky header height; a section counts as "in view" while it spans this line.
const OFFSET = 88 + 1

/**
 * The home section currently under the header, or null. Only tracks on the
 * home page (`enabled`), where the section links live.
 */
export function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    let frame = 0

    const update = () => {
      frame = 0
      let current: string | null = null
      for (const id of sections) {
        const rect = document.getElementById(id)?.getBoundingClientRect()
        if (rect && rect.top <= OFFSET && rect.bottom > OFFSET) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [enabled])

  return enabled ? active : null
}
