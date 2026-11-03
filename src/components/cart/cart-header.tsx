import Link from "next/link"

import { cn } from "@/lib/utils"

import { eyebrow } from "../home/styles"

export function CartHeader({ pieces }: { pieces: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 pb-6 sm:gap-8 sm:pb-8">
      <div>
        <span className={cn(eyebrow, "mb-2")}>
          Your Bag · {String(pieces).padStart(2, "0")}{" "}
          {pieces === 1 ? "Piece" : "Pieces"}
        </span>
        <h1 className="font-heading text-[clamp(36px,6vw,88px)] leading-none font-bold tracking-[-0.02em]">
          The Bag
        </h1>
      </div>
      <Link
        href="/watches"
        className="border-b-4 pb-1 font-heading text-sm leading-6 font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"
      >
        ← Continue Browsing
      </Link>
    </div>
  )
}
