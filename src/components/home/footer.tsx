import { cn } from "@/lib/utils"

import { gutter, labelCaps } from "./styles"
import { ScrollLink } from "./scroll-link"

const columns = [
  { title: "Shop", links: ["All Timepieces", "Compare", "Wishlist", "Bag"] },
  { title: "Tools", links: ["Timepiece Advisor", "Size Guide"] },
  { title: "House", links: ["Craft & Manifesto", "Journal"] },
  { title: "Service", links: ["Armored Courier", "Currency", "Contact"] },
]

export function Footer() {
  return (
    <footer id="footer" className="border-t-4 bg-background">
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
                  key={link}
                  href="/#top"
                  className="font-sans text-base leading-6 text-foreground transition-colors hover:text-gold"
                >
                  {link}
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

      <div className="border-t-4">
        <div
          className={cn(
            gutter,
            "flex flex-wrap justify-between gap-4 py-6 font-mono text-[11px] tracking-[.2em] text-muted-foreground uppercase"
          )}
        >
          <span>© 2026 XII — The Luxury Timepiece Archive</span>
          <span>Armored courier · Ferrari Group / Malca-Amit</span>
          <span>USD $ · EUR € · GBP £ · CHF Fr · JPY ¥</span>
        </div>
      </div>
    </footer>
  )
}
