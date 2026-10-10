import { cn } from "@/lib/utils"

import { Blueprint } from "./blueprint"
import { LiveHands, LiveTime } from "./live-clock"
import { Reveal } from "./reveal"
import { button, gridBackdrop, monoCaption } from "./styles"
import { ScrollLink } from "./scroll-link"

const corner = "absolute font-mono text-xs text-surface-variant"

export function Hero() {
  return (
    <header
      id="top"
      className="relative flex min-h-[max(720px,calc(100vh-88px))] items-center justify-center overflow-hidden border-b-4 bg-[#141515]"
    >
      <div className={cn(gridBackdrop, "opacity-[.06]")} />
      <div className="circle pointer-events-none absolute top-1/2 left-1/2 size-[850px] -translate-x-1/2 -translate-y-1/2 bg-gold/10 blur-[120px]" />
      <span className={cn(corner, "top-6 left-6")}>+</span>
      <span className={cn(corner, "top-6 right-6")}>+</span>
      <span className={cn(corner, "bottom-6 left-6")}>+</span>
      <span className={cn(corner, "right-6 bottom-6")}>+</span>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Blueprint className="w-[min(640px,88vw)] opacity-[.22]" />
        <LiveHands />
      </div>

      <div className="relative z-[2] flex flex-col items-center px-6 py-24 text-center">
        <LiveTime />
        <Reveal delay={120}>
          <h1 className="font-heading text-[clamp(120px,17vw,240px)] leading-[0.85] font-bold tracking-[-0.04em]">
            XII
          </h1>
        </Reveal>
        <Reveal delay={240} className="mt-5 flex items-center gap-3">
          <span className="h-px w-6 bg-gold" />
          <span className="font-heading text-sm font-semibold tracking-[.35em] text-gold uppercase">
            Haute Horlogerie
          </span>
          <span className="h-px w-6 bg-gold" />
        </Reveal>
        <Reveal delay={320}>
          <p className="mt-7 max-w-[560px] font-sans text-[22px] leading-8 text-pretty text-muted-foreground">
            Timepieces exhibited as architecture. Heavy cases, exposed calibers,
            nothing ornamental.
          </p>
        </Reveal>
        <Reveal
          delay={420}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <ScrollLink
            href="/#drop"
            className={cn(
              button,
              "border-foreground bg-gold text-white hover:bg-black"
            )}
          >
            Enter the Exhibition
          </ScrollLink>
          <ScrollLink
            href="/#advisor"
            className={cn(
              button,
              "border-foreground bg-background text-foreground hover:bg-foreground hover:text-black"
            )}
          >
            Find Your Timepiece
          </ScrollLink>
        </Reveal>
        <Reveal delay={520}>
          <p
            className={cn(
              monoCaption,
              "mt-10 text-[11px] tracking-[.2em] uppercase"
            )}
          >
            The Luxury Timepiece Archive • Est. 2026
          </p>
        </Reveal>
      </div>
    </header>
  )
}
