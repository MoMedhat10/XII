import type { AdminBrand } from "@/app/(dashboard)/dashboard/watches/_data/types"

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
