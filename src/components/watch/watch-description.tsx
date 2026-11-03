"use client"

import { useState } from "react"

const CUT = 180

/** Long descriptions start clipped at a word boundary, with a Read more toggle. */
export function WatchDescription({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const long = text.length > CUT
  const shown =
    open || !long ? text : text.slice(0, CUT).replace(/\s+\S*$/, "") + "…"

  return (
    <>
      <p className="max-w-[640px] font-sans text-lg leading-8 text-pretty whitespace-pre-line text-foreground sm:text-xl">
        {shown}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-5 cursor-pointer border-b-2 border-foreground pb-1 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"
        >
          {open ? "Read less" : "Read more"}
        </button>
      )}
    </>
  )
}
