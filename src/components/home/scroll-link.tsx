"use client"

import type { ComponentProps } from "react"
import Link from "next/link"

type ScrollLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string
}

// Smooth-scrolls to an on-page section without adding "#section" to the URL.
// Falls back to normal navigation when the target isn't on the current page
// (or for modified clicks like cmd/ctrl-click).
export function ScrollLink({ href, onClick, ...props }: ScrollLinkProps) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return
        }
        const id = href.split("#")[1]
        const target = id ? document.getElementById(id) : null
        if (!target) return
        event.preventDefault()
        target.scrollIntoView({ behavior: "smooth" })
      }}
      {...props}
    />
  )
}
