import Link from "next/link"

import { getCurrentUser } from "@/app/(auth)/_utils/session"
import { cn } from "@/lib/utils"

import { ScrollLink } from "./scroll-link"
import { gutter, labelCaps } from "./styles"

const links = [
  { label: "Exhibition", href: "/#drop", active: true },
  { label: "Catalog", href: "/#drop" },
  { label: "Finder", href: "/#advisor" },
  { label: "About", href: "/#craft" },
  { label: "Journal", href: "/#footer" },
]

const actionBase =
  "inline-flex h-10 items-center justify-center border-4 border-foreground transition-colors"

function HeartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M4 7h16l-1 14H5L4 7Z" />
      <path d="M8 7V5a4 4 0 0 1 8 0v2" />
    </svg>
  )
}

export async function Nav() {
  const user = await getCurrentUser()

  return (
    <nav className="sticky top-0 z-50 border-b-4 bg-background">
      <div
        className={cn(
          gutter,
          "flex h-[84px] items-center justify-between gap-8"
        )}
      >
        <ScrollLink
          href="/#top"
          className="font-heading text-4xl leading-none font-bold tracking-[-0.02em]"
        >
          XII
        </ScrollLink>

        <div className="hidden gap-[clamp(16px,2.6vw,40px)] md:flex">
          {links.map((link) => (
            <ScrollLink
              key={link.label}
              href={link.href}
              className={cn(
                labelCaps,
                "border-b-4 py-1.5 transition-colors",
                link.active
                  ? "border-gold"
                  : "border-transparent hover:border-foreground"
              )}
            >
              {link.label}
            </ScrollLink>
          ))}
        </div>

        <div className="flex gap-3">
          {user ? (
            <>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className={cn(
                  actionBase,
                  "w-10 bg-background hover:bg-foreground hover:text-black"
                )}
              >
                <HeartIcon />
              </Link>
              <Link
                href="/cart"
                aria-label="Bag"
                className={cn(
                  actionBase,
                  "w-10 bg-foreground text-black hover:bg-background hover:text-foreground"
                )}
              >
                <BagIcon />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  actionBase,
                  "bg-background px-4 font-sans text-xs font-bold tracking-[1.5px] uppercase hover:bg-foreground hover:text-black"
                )}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={cn(
                  actionBase,
                  "bg-foreground px-4 font-sans text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-gold hover:text-white"
                )}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
