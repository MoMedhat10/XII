"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowUpRight,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

import { LogoutButton } from "@/components/home/logout-button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { ADMIN_NAV, SIDEBAR_COOKIE, isActive } from "./admin-nav"

export type AdminShellUser = { username: string; email: string }

const ONE_YEAR = 60 * 60 * 24 * 365

const sectionLabel =
  "px-5 pt-6 pb-2 font-mono text-[10px] tracking-[1.5px] text-muted-foreground uppercase"

const footerBtn =
  "flex h-11 items-center gap-3 border-2 border-surface-variant px-3 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:border-foreground hover:bg-foreground hover:text-black"

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        collapsed && "flex-col gap-1.5"
      )}
    >
      <Link
        href="/dashboard"
        className="font-heading text-[28px] leading-none font-bold tracking-[-0.02em] hover:text-gold"
      >
        XII
      </Link>
      <span className="bg-gold px-1.5 py-[3px] font-heading text-[10px] leading-4 font-bold tracking-[1.5px] text-black">
        ADMIN
      </span>
    </div>
  )
}

function NavLinks({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto pb-6">
      {ADMIN_NAV.map(({ section, items }, i) => (
        <div key={section ?? i}>
          {section &&
            (collapsed ? (
              <div
                aria-hidden="true"
                className="mx-5 mt-5 mb-2 border-t-2 border-surface-variant"
              />
            ) : (
              <div className={sectionLabel}>{section}</div>
            ))}
          <ul className={cn(!section && "pt-4")}>
            {items.map((item) => {
              const active = isActive(pathname, item)
              const Icon = item.icon
              const row = cn(
                "flex h-12 items-center gap-3.5 border-l-4 font-heading text-[13px] font-bold tracking-[1.5px] uppercase transition-colors",
                collapsed ? "justify-center px-0" : "px-4",
                active
                  ? "border-gold bg-foreground/[0.06] text-foreground"
                  : "border-transparent text-muted-foreground"
              )
              const content = (
                <>
                  <Icon aria-hidden="true" className="size-[18px] shrink-0" />
                  <span className={cn(collapsed && "sr-only")}>
                    {item.label}
                  </span>
                  {item.soon && !collapsed && (
                    <span className="ml-auto border border-surface-variant px-1.5 font-mono text-[9px] tracking-[1px] text-muted-foreground">
                      SOON
                    </span>
                  )}
                </>
              )

              return (
                <li key={item.href}>
                  {item.soon ? (
                    <span
                      aria-disabled="true"
                      title={`${item.label} · coming soon`}
                      className={cn(row, "cursor-not-allowed opacity-60")}
                    >
                      {content}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        row,
                        !active &&
                          "hover:border-foreground hover:text-foreground"
                      )}
                    >
                      {content}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function SidebarFooter({
  user,
  collapsed = false,
}: {
  user: AdminShellUser
  collapsed?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t-4 p-4",
        collapsed && "items-center px-2"
      )}
    >
      {!collapsed && (
        <div className="flex min-w-0 flex-col gap-0.5 pb-2">
          <span className="truncate font-heading text-sm font-bold">
            {user.username}
          </span>
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {user.email}
          </span>
        </div>
      )}
      <Link
        href="/"
        title="View store"
        className={cn(footerBtn, collapsed && "w-11 justify-center px-0")}
      >
        <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
        <span className={cn(collapsed && "sr-only")}>View store</span>
      </Link>
      <LogoutButton
        title="Log out"
        className={cn(footerBtn, collapsed && "w-11 justify-center px-0")}
      >
        <LogOut aria-hidden="true" className="size-4 shrink-0" />
        <span className={cn(collapsed && "sr-only")}>Log out</span>
      </LogoutButton>
    </div>
  )
}

export function AdminShell({
  user,
  defaultCollapsed,
  children,
}: {
  user: AdminShellUser
  defaultCollapsed: boolean
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    // the layout reads it on the next request, so the sidebar doesn't flash open
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "open"}; path=/; max-age=${ONE_YEAR}; samesite=lax`
  }

  return (
    <div className="dark min-h-dvh bg-background text-foreground lg:flex">
      {/* Desktop: sticky sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r-4 bg-background transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-[264px]"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-2 border-b-4 px-5",
            collapsed ? "h-[120px] flex-col justify-center px-2" : "h-[84px]"
          )}
        >
          <Brand collapsed={collapsed} />
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex size-9 items-center justify-center border-2 border-surface-variant text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="size-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        <NavLinks collapsed={collapsed} />
        <SidebarFooter user={user} collapsed={collapsed} />
      </aside>

      {/* Mobile / tablet: top bar + slide-out menu */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b-4 bg-background px-4 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex size-10 items-center justify-center border-4 transition-colors hover:bg-foreground hover:text-black"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </header>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="dark gap-0 bg-background p-0 text-foreground data-[side=left]:w-[280px] data-[side=left]:border-foreground"
        >
          <div className="flex h-16 items-center border-b-4 px-5">
            <SheetTitle asChild>
              <div>
                <Brand />
              </div>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Admin navigation
            </SheetDescription>
          </div>
          <NavLinks onNavigate={() => setMobileOpen(false)} />
          <SidebarFooter user={user} />
        </SheetContent>
      </Sheet>

      <main className="min-w-0 flex-1 px-[clamp(16px,3.2vw,48px)] pt-8 pb-24 lg:pt-12 lg:pb-[120px]">
        <div className="mx-auto max-w-[1280px]">{children}</div>
      </main>
    </div>
  )
}
