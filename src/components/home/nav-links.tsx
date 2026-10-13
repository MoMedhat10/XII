"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { ScrollLink } from "./scroll-link"
import { labelCaps } from "./styles"

const links = [
  { label: "Exhibition", id: "top" },
  { label: "Catalog", id: "drop" },
  { label: "Finder", id: "advisor" },
  { label: "About", id: "craft" },
  { label: "Journal", id: "footer" },
]

// Sticky nav height; a section counts as "entered" once its top passes this line.
const OFFSET = 84 + 1

export function NavLinks() {
  const [activeId, setActiveId] = useState(links[0].id)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2

      let current = links[0].id
      if (atBottom) {
        current = links[links.length - 1].id
      } else {
        for (const { id } of links) {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= OFFSET) current = id
        }
      }
      setActiveId(current)
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
  }, [])

  return (
    <div className="hidden gap-[clamp(16px,2.6vw,40px)] md:flex">
      {links.map((link) => (
        <ScrollLink
          key={link.label}
          href={`/#${link.id}`}
          aria-current={link.id === activeId ? "true" : undefined}
          className={cn(
            labelCaps,
            "border-b-4 py-1.5 transition-colors",
            link.id === activeId
              ? "border-gold"
              : "border-transparent hover:border-foreground"
          )}
        >
          {link.label}
        </ScrollLink>
      ))}
    </div>
  )
}
