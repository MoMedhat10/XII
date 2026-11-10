import type { AdminBrand } from "@/app/(dashboard)/dashboard/watches/_data/types"

export const pad = (n: number) => String(n).padStart(2, "0")

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})
export const formatPrice = (cents: number) =>
  wholeDollars.format(Math.round(cents / 100))

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase()

export const brandNameFor = (brands: AdminBrand[], id: string) =>
  brands.find((brand) => brand.id === id)?.name ?? "—"

/** Radix portals render outside the shell, so modals re-apply the theme. */
export const portalTheme = "dark text-foreground"

export const btn =
  "h-[52px] gap-2.5 px-6 font-sans text-[13px] font-bold tracking-[1.5px] uppercase"
export const btnGold =
  "border-gold bg-gold text-black hover:border-foreground hover:bg-foreground hover:text-black"
/** Destructive actions (delete). Red, never gold: gold means "go ahead". */
export const btnDanger =
  "border-danger bg-danger text-black hover:border-foreground hover:bg-foreground hover:text-black"
export const btnOutline =
  "border-foreground bg-background text-foreground hover:bg-foreground hover:text-black"

export const closeBtn =
  "flex size-11 shrink-0 items-center justify-center border-4 border-foreground bg-background font-heading text-lg font-bold transition-colors hover:bg-foreground hover:text-black"

export const eyebrowSm =
  "font-heading text-xs leading-4 font-bold tracking-[1.5px] text-gold uppercase"
export const fieldLabel =
  "font-heading text-xs leading-4 font-bold tracking-[1.5px] text-muted-foreground uppercase"
export const fieldControl =
  "h-12 border-2 border-foreground bg-[#141515] px-3.5 text-[15px] text-foreground focus:border-gold focus:ring-0 aria-invalid:border-danger aria-invalid:focus:border-danger dark:border-foreground dark:bg-[#141515] dark:focus:border-gold dark:aria-invalid:border-danger dark:aria-invalid:focus:border-danger"
export const fieldError = "text-[13px] font-medium text-danger"
export const textLinkDanger =
  "self-start border-b-2 border-danger/40 pb-0.5 font-sans text-xs font-bold tracking-[1.5px] text-danger uppercase transition-colors hover:border-danger"
export const monoCaps =
  "font-mono text-xs tracking-[1px] text-muted-foreground uppercase"
