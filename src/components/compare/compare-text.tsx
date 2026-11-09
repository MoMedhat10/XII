"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

/** Long text clamped to 6 lines, with Read more / Show less. */
export function CompareText({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const long = text.length > 220

  return (
    <div className="flex flex-col items-start gap-2">
      <p
        className={cn(
          "font-sans text-sm leading-6 whitespace-pre-line text-muted-foreground",
          long && !open && "line-clamp-6"
        )}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="cursor-pointer border-b-2 border-current font-sans text-xs font-bold tracking-[1.5px] uppercase hover:text-gold"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  )
}
