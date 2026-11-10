import {
  LayoutGrid,
  Package,
  Tag,
  Users,
  Watch,
  type LucideIcon,
} from "lucide-react"

export type AdminNavItem = {
  label: string
  href: string
  icon: LucideIcon
  /** only this exact path counts as active (the overview) */
  exact?: boolean
  /** not built yet: shown in the nav, but not linked */
  soon?: boolean
}

export const ADMIN_NAV: { section: string | null; items: AdminNavItem[] }[] = [
  {
    section: null,
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutGrid, exact: true },
    ],
  },
  {
    section: "Catalog",
    items: [
      { label: "Watches", href: "/dashboard/watches", icon: Watch },
      { label: "Brands", href: "/dashboard/brands", icon: Tag, soon: true },
    ],
  },
  {
    section: "Commerce",
    items: [
      { label: "Orders", href: "/dashboard/orders", icon: Package, soon: true },
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: Users,
        soon: true,
      },
    ],
  },
]

/** Cookie holding the desktop sidebar's collapsed state, read by the layout. */
export const SIDEBAR_COOKIE = "xii_admin_sidebar"

export const isActive = (pathname: string, item: AdminNavItem) =>
  item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`)
