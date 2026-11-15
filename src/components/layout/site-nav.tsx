"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

import { ScrollLink } from "../home/scroll-link"
import { gutter, labelCaps, monoCaption, textLink } from "../home/styles"
import { AccountMenu } from "./account-menu"
import { BagIcon, HeartIcon } from "./icons"
import { MobileMenu } from "./mobile-menu"
import {
  isLinkActive,
  isPathActive,
  navLinks,
  useActiveSection,
  type HeaderUser,
} from "./nav-config"
import { action, actionOutline, actionSolid, actionText } from "./styles"

// 84px bar + 4px border = 88px: `scroll-padding-top` in globals.css and the
// `calc(100vh-88px)` full-height states rely on this height.
const bar = "flex h-[84px] items-center justify-between gap-6 lg:gap-8"

function Logo() {
  return (
    <ScrollLink
      href="/#top"
      aria-label="XII home"
      className="font-heading text-4xl leading-none font-bold tracking-[-0.02em] transition-colors hover:text-gold"
    >
      XII
    </ScrollLink>
  )
}

const pageIf = (active: boolean) => (active ? ("page" as const) : undefined)

function BagLink({ count, active }: { count: number; active: boolean }) {
  const label =
    count === 0 ? "Bag" : `Bag, ${count} ${count === 1 ? "watch" : "watches"}`
  return (
    <Link
      href="/cart"
      aria-label={label}
      aria-current={pageIf(active)}
      className={cn(action, actionSolid, "relative w-10")}
    >
      <BagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-3 -right-3 flex h-6 min-w-6 items-center justify-center border-2 border-background bg-gold px-1 font-mono text-[11px] leading-none font-bold text-black"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}

/** Checkout keeps the customer on task: just the logo and a way back. */
function CheckoutBar() {
  return (
    <div className={cn(gutter, bar)}>
      <Logo />
      <span className={cn(monoCaption, "hidden uppercase sm:inline")}>
        Secure checkout · Insured delivery
      </span>
      <Link href="/cart" className={textLink}>
        ← Back to bag
      </Link>
    </div>
  )
}

export function SiteNav({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname()
  const activeSection = useActiveSection(pathname === "/")

  if (isPathActive(pathname, "/checkout")) {
    return (
      <header className="sticky top-0 z-50 border-b-4 bg-background">
        <CheckoutBar />
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b-4 bg-background">
      <div className={cn(gutter, bar)}>
        <Logo />

        <nav
          aria-label="Main"
          className="hidden gap-[clamp(16px,2.6vw,40px)] md:flex"
        >
          {navLinks.map((link) => {
            const active = isLinkActive(link, pathname, activeSection)
            return (
              <ScrollLink
                key={link.href}
                href={link.href}
                aria-current={pageIf(active)}
                className={cn(
                  labelCaps,
                  "border-b-4 py-1.5 transition-colors",
                  active
                    ? "border-gold"
                    : "border-transparent hover:border-foreground"
                )}
              >
                {link.label}
              </ScrollLink>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                aria-current={pageIf(isPathActive(pathname, "/wishlist"))}
                className={cn(
                  action,
                  actionOutline,
                  "hidden w-10 md:inline-flex"
                )}
              >
                <HeartIcon />
              </Link>
              <BagLink
                count={user.bagCount}
                active={isPathActive(pathname, "/cart")}
              />
              <div className="hidden md:block">
                <AccountMenu user={user} />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(action, actionOutline, actionText)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={cn(
                  action,
                  actionText,
                  "hidden bg-foreground text-black hover:bg-gold hover:text-white sm:inline-flex"
                )}
              >
                Register
              </Link>
            </>
          )}
          <MobileMenu
            user={user}
            pathname={pathname}
            activeSection={activeSection}
          />
        </div>
      </div>
    </header>
  )
}
