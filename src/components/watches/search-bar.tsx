"use client"

import { useRef } from "react"

import { useSlashFocus } from "@/app/(app)/watches/_hooks/use-slash-focus"
import { cn } from "@/lib/utils"

import { enter } from "./catalog-toolbar"

export function SearchBar({
  value,
  onChange,
  onClear,
}: {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  useSlashFocus(inputRef)

  return (
    <div
      style={{ animationDelay: "80ms" }}
      className={cn(
        enter,
        "flex items-stretch border-4 bg-[#141515] transition-colors focus-within:border-gold"
      )}
    >
      <span className="flex w-16 flex-none items-center justify-center border-r-4">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      </span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or brand"
        aria-label="Search watches"
        maxLength={100}
        className="h-16 min-w-0 flex-1 border-0 bg-transparent px-5 font-heading text-[22px] font-medium outline-none placeholder:text-[#8a8384] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onClear()
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          className="w-16 flex-none border-l-4 font-heading text-lg font-bold transition-colors hover:bg-foreground hover:text-black"
        >
          ✕
        </button>
      )}
      <span className="hidden flex-none items-center px-5 font-mono text-xs text-[#8a8384] sm:flex">
        PRESS
        <kbd className="ml-1.5 border-2 border-surface-variant px-1.5 text-muted-foreground">
          /
        </kbd>
      </span>
    </div>
  )
}
