"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const NAV = [
  { label: "Watches", href: "/dashboard/watches" },
  // Not built yet: shown so the nav matches the design, but not linked.
  { label: "Orders", href: "/dashboard/orders", soon: true },
]

const navLink =
  "border-b-4 py-1.5 font-heading text-xs leading-6 font-bold tracking-[1.5px] uppercase transition-colors sm:text-sm"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="dark min-h-dvh bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b-4 bg-background">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-[clamp(16px,4.4vw,64px)] sm:h-[84px] sm:gap-8">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <Link
              href="/"
              className="font-heading text-[28px] leading-none font-bold tracking-[-0.02em] hover:text-gold sm:text-4xl"
            >
              XII
            </Link>
            <span className="bg-gold px-2 py-[3px] font-heading text-[11px] leading-4 font-bold tracking-[1.5px] text-black">
              ADMIN
            </span>
          </div>

          <div className="flex gap-[clamp(14px,2.6vw,40px)]">
            {NAV.map(({ label, href, soon }) => {
              const active = pathname.startsWith(href)
              return soon ? (
                <span
                  key={href}
                  aria-disabled="true"
                  title="Coming soon"
                  className={cn(
                    navLink,
                    "cursor-not-allowed border-transparent text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              ) : (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    navLink,
                    active
                      ? "border-gold"
                      : "border-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          <Link
            href="/"
            className="inline-flex h-10 items-center border-4 px-3 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:bg-foreground hover:text-black sm:px-3.5"
          >
            <span className="max-sm:sr-only">View store</span>
            <span aria-hidden="true" className="sm:ml-1.5">
              ↗
            </span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-[1440px] px-[clamp(16px,4.4vw,64px)] pt-10 pb-24 sm:pt-[72px] sm:pb-[120px]">
        {children}
      </main>
    </div>
  )
}
