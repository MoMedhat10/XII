import { cn } from "@/lib/utils"

import { Reveal } from "./reveal"
import { eyebrow, gutter } from "./styles"

const quotes = [
  {
    text: "It wears like a building — heavy, exact, and completely sure of itself.",
    who: "Private Collector",
    where: "Geneva",
  },
  {
    text: "The only house that ships a technical drawing with the watch. I framed it.",
    who: "Architect",
    where: "Tokyo",
  },
  {
    text: "Acquisition was handled like an art transfer. Armored courier, signed provenance.",
    who: "Private Collector",
    where: "New York",
  },
  {
    text: "Forty pieces in my collection. This is the one people ask about.",
    who: "Collector",
    where: "Dubai",
  },
  {
    text: "The micro-rotor sits so low the case barely registers under a cuff.",
    who: "Watchmaker",
    where: "Le Locle",
  },
  {
    text: "No logo on the dial, no gloss on the case. Restraint, done properly.",
    who: "Industrial Designer",
    where: "Milan",
  },
  {
    text: "The size guide was right to the millimetre. 40mm, exactly as shown.",
    who: "Client",
    where: "London",
  },
  {
    text: "I listened to the caliber sample before buying. It sounds better in person.",
    who: "Collector",
    where: "Singapore",
  },
  {
    text: "The advisor talked me out of the piece I wanted — and into the right one.",
    who: "Client",
    where: "Zürich",
  },
  {
    text: "Brushed titanium, sharp chamfers. It has aged better than my car.",
    who: "Private Collector",
    where: "Los Angeles",
  },
]

function Marquee({
  items,
  animation,
}: {
  items: typeof quotes
  animation: string
}) {
  return (
    <div
      className={cn(
        "flex w-max items-stretch gap-8 pr-8 hover:[animation-play-state:paused] motion-reduce:animate-none",
        animation
      )}
    >
      {[0, 1].map((copy) =>
        items.map((q) => (
          <figure
            key={`${copy}-${q.who}-${q.where}`}
            aria-hidden={copy === 1}
            className="m-0 flex w-[440px] flex-none flex-col justify-between gap-10 border-4 bg-background p-8 transition-colors duration-200 hover:bg-foreground hover:text-black"
          >
            <blockquote className="m-0 font-sans text-[22px] leading-8 text-pretty whitespace-normal">
              “{q.text}”
            </blockquote>
            <figcaption className="flex justify-between gap-4 border-t-2 border-current pt-4">
              <span className="font-heading text-sm leading-6 font-bold tracking-[1.5px] uppercase">
                {q.who}
              </span>
              <span className="font-sans text-sm leading-6">{q.where}</span>
            </figcaption>
          </figure>
        ))
      )}
    </div>
  )
}

export function Collectors() {
  return (
    <section className="border-t-4 bg-[#141515]">
      <div className={cn(gutter, "pt-32")}>
        <Reveal className="mb-12 border-b-4 pb-8">
          <span className={`${eyebrow} mb-2`}>05 — Collectors</span>
          <h2 className="font-heading text-[40px] leading-12 font-semibold">
            From the private register.
          </h2>
        </Reveal>
      </div>
      <div className="flex flex-col gap-8 overflow-hidden pb-32">
        <Marquee
          items={quotes.slice(0, 5)}
          animation="animate-[xii-marquee_70s_linear_infinite]"
        />
        <Marquee
          items={quotes.slice(5)}
          animation="animate-[xii-marquee_80s_linear_infinite_reverse]"
        />
      </div>
    </section>
  )
}
