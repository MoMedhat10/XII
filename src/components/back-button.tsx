"use client"

import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

export function BackButton({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() =>
        window.history.length > 1 ? router.back() : router.push("/")
      }
      className={cn(
        "inline-flex h-10 cursor-pointer items-center gap-2 border-4 border-foreground bg-background px-4 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:bg-foreground hover:text-black",
        className
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      Back
    </button>
  )
}
