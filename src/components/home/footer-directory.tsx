import { cn } from "@/lib/utils"

import { gutter, labelCaps } from "./styles"
import { ScrollLink } from "./scroll-link"

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Timepieces", href: "/watches" },
      { label: "Compare", href: "/compare" },
    ],
  },
  {
    // these pages send guests to sign in, so the column suits everyone
    title: "Your Account",
    links: [
      { label: "Bag", href: "/cart" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Orders", href: "/orders" },
    ],
  },
  {
    title: "House",
    links: [
      { label: "Size Guide", href: "/#advisor" },
      { label: "Craft & Manifesto", href: "/#craft" },
    ],
  },
]

/**
 * The home page's closing directory: newsletter, site links and the giant
 * wordmark. The layout's SiteFooter strip follows it.
 */
export function FooterDirectory() {
  return (
    <section
      id="footer"
      aria-label="Directory"
      className="border-t-4 bg-background"
    >
      <div className={cn(gutter, "pt-24")}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-x-8 gap-y-12 pb-16">
          <div className="col-span-2 flex max-w-[440px] min-w-0 flex-col gap-4">
            <span className={labelCaps}>The Monograph Letter</span>
            <p className="font-sans text-base leading-[26px] text-muted-foreground">
              New exhibits and journal essays, sent four times a year.
            </p>
            <div className="flex">
              <input
                type="email"
                aria-label="Email address"
                placeholder="Email address"
                className="h-14 min-w-0 flex-1 border-4 border-r-0 border-foreground bg-black px-4 font-sans text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                className="h-14 border-4 border-foreground bg-foreground px-5 font-sans text-sm font-bold tracking-[1.5px] text-black uppercase transition-colors hover:bg-gold hover:text-white"
              >
                Join
              </button>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span
                className={cn(
                  labelCaps,
                  "border-b-2 border-surface-variant pb-2 text-gold"
                )}
              >
                {col.title}
              </span>
              {col.links.map((link) => (
                <ScrollLink
                  key={link.href}
                  href={link.href}
                  className="font-sans text-base leading-6 text-foreground transition-colors hover:text-gold"
                >
                  {link.label}
                </ScrollLink>
              ))}
            </div>
          ))}
        </div>

        <div
          aria-hidden="true"
          className="-mb-[0.02em] font-heading text-[clamp(160px,30vw,440px)] leading-[0.78] font-bold tracking-[-0.05em] text-card select-none"
        >
          XII
        </div>
      </div>
    </section>
  )
}
