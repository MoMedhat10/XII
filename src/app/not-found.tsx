import type { Metadata } from "next"
import Link from "next/link"

import { Nav } from "@/components/home/nav"
import { button, gridBackdrop, gutter } from "@/components/home/styles"
import { StoppedWatch } from "@/components/not-found/stopped-watch"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Page not found — XII",
  description: "The page you were looking for doesn't exist.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="dark bg-background text-foreground">
      <Nav />
      <main className="relative flex min-h-[calc(100vh-88px)] items-center overflow-hidden bg-[#141515]">
        <div className={cn(gridBackdrop, "opacity-[0.06]")} />
        <div
          className={cn(
            gutter,
            "relative grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(48px,6vw,96px)] py-16 sm:py-24"
          )}
        >
          <StoppedWatch />

          <div className="flex w-full max-w-[600px] animate-[xii-up_.8s_cubic-bezier(.2,.7,.2,1)_.3s_both] flex-col items-start gap-6 motion-reduce:animate-none">
            <span className="border-4 border-gold px-3.5 py-1.5 font-heading text-xs leading-6 font-bold tracking-[1.5px] text-gold uppercase sm:text-sm">
              Error 404 · Page not found
            </span>
            <p
              aria-hidden="true"
              className="font-heading text-[clamp(96px,13vw,200px)] leading-[0.85] font-bold tracking-[-0.04em]"
            >
              4:04
            </p>
            <h1 className="font-heading text-[clamp(32px,3.4vw,48px)] leading-[1.05] font-bold tracking-[-0.02em] text-balance">
              This hour doesn&apos;t exist.
            </h1>
            <p className="font-sans text-lg leading-7 text-pretty text-muted-foreground sm:text-[22px] sm:leading-8">
              The page you were looking for has been moved, retired from the
              archive, or never wound at all.
            </p>
            <div className="mt-2 flex flex-wrap gap-4">
              <Link
                href="/"
                className={cn(
                  button,
                  "border-foreground bg-gold text-white hover:bg-black"
                )}
              >
                Return Home
              </Link>
              <Link
                href="/#drop"
                className={cn(
                  button,
                  "border-foreground bg-background hover:bg-foreground hover:text-black"
                )}
              >
                Browse Catalog
              </Link>
            </div>
            <span className="font-mono text-[11px] tracking-[.2em] text-muted-foreground uppercase">
              Still lost?{" "}
              <Link
                href="/"
                className="border-b-2 border-surface-variant text-foreground transition-colors hover:border-gold hover:text-gold"
              >
                Contact concierge
              </Link>
            </span>
          </div>
        </div>
      </main>

      <footer className="border-t-4 bg-background">
        <div
          className={cn(
            gutter,
            "flex flex-wrap justify-between gap-4 py-6 font-mono text-[11px] tracking-[.2em] text-muted-foreground uppercase"
          )}
        >
          <span>© 2026 XII — The Luxury Timepiece Archive</span>
          <span>Armored courier · Ferrari Group / Malca-Amit</span>
        </div>
      </footer>
    </div>
  )
}
