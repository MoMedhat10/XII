"use client"

import { useRef, useState } from "react"
import Link from "next/link"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { useLogout } from "../home/logout-button"
import { labelCaps, monoCaption } from "../home/styles"
import { CloseIcon, MenuIcon } from "./icons"
import {
  isLinkActive,
  isPathActive,
  navLinks,
  type HeaderUser,
} from "./nav-config"
import { action, actionOutline, actionSolid, actionText } from "./styles"

const row = cn(
  labelCaps,
  "flex items-center justify-between border-b-2 border-surface-variant px-6 py-4 transition-colors hover:bg-foreground hover:text-black"
)

/** Below md: a menu button that opens the site navigation in a side sheet. */
export function MobileMenu({
  user,
  pathname,
  activeSection,
}: {
  user: HeaderUser | null
  pathname: string
  activeSection: string | null
}) {
  const [open, setOpen] = useState(false)
  // A home section to scroll to once the sheet (and its scroll lock) is gone.
  const pendingSection = useRef<string | null>(null)
  const { signOut, pending } = useLogout()
  const close = () => setOpen(false)

  const onSectionClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    section: string
  ) => {
    if (!document.getElementById(section)) return close() // navigate to home
    event.preventDefault()
    pendingSection.current = section
    close()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className={cn(action, actionOutline, "w-10 md:hidden")}
        >
          <MenuIcon />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="dark gap-0 overflow-y-auto bg-background p-0 text-foreground data-[side=right]:w-[min(340px,88vw)] data-[side=right]:border-foreground"
        onCloseAutoFocus={(event) => {
          const section = pendingSection.current
          if (!section) return
          pendingSection.current = null
          event.preventDefault()
          requestAnimationFrame(() =>
            document
              .getElementById(section)
              ?.scrollIntoView({ behavior: "smooth" })
          )
        }}
      >
        <div className="flex h-[84px] shrink-0 items-center justify-between border-b-4 px-6">
          <SheetTitle asChild>
            <span className="font-heading text-4xl leading-none font-bold tracking-[-0.02em]">
              XII
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close menu"
              className={cn(action, actionOutline, "w-10")}
            >
              <CloseIcon />
            </button>
          </SheetClose>
        </div>

        <nav aria-label="Mobile" className="flex flex-col">
          {navLinks.map((link) => {
            const active = isLinkActive(link, pathname, activeSection)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={(event) =>
                  link.section ? onSectionClick(event, link.section) : close()
                }
                className={cn(row, active && "text-gold")}
              >
                {link.label}
                <span aria-hidden="true">→</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col border-t-4">
          {user ? (
            <>
              <span className={cn(monoCaption, "px-6 pt-5 pb-2 uppercase")}>
                Signed in as {user.username}
              </span>
              <Link
                href="/wishlist"
                onClick={close}
                aria-current={
                  isPathActive(pathname, "/wishlist") ? "page" : undefined
                }
                className={row}
              >
                Wishlist
              </Link>
              <Link
                href="/orders"
                onClick={close}
                aria-current={
                  isPathActive(pathname, "/orders") ? "page" : undefined
                }
                className={row}
              >
                Orders
              </Link>
              {user.isAdmin && (
                <Link
                  href="/dashboard"
                  onClick={close}
                  className={cn(row, "text-gold")}
                >
                  Admin dashboard
                </Link>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  close()
                  signOut()
                }}
                className={cn(
                  row,
                  "cursor-pointer border-b-0 text-left disabled:opacity-50"
                )}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-6">
              <Link
                href="/login"
                onClick={close}
                className={cn(action, actionOutline, actionText)}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={close}
                className={cn(action, actionSolid, actionText)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
