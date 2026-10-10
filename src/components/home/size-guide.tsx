"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { Reveal } from "./reveal"
import { eyebrow, gridBackdrop, gutter, sectionTitle } from "./styles"

const sizes = [
  { mm: 38, wrist: "14 – 16 cm", range: [14, 16] },
  { mm: 40, wrist: "15 – 17 cm", range: [15, 17] },
  { mm: 42, wrist: "16 – 18 cm", range: [16, 18] },
  { mm: 44, wrist: "17 – 19 cm", range: [17, 19] },
]

const caseTicks = Array.from({ length: 60 }, (_, i) => {
  const a = (i * 6 * Math.PI) / 180
  const big = i % 5 === 0
  const r2 = big ? 40 : 44
  return {
    x1: (50 + 47 * Math.sin(a)).toFixed(2),
    y1: (50 - 47 * Math.cos(a)).toFixed(2),
    x2: (50 + r2 * Math.sin(a)).toFixed(2),
    y2: (50 - r2 * Math.cos(a)).toFixed(2),
    stroke: i === 0 ? "#B08D57" : "#f9f9f9",
    width: big ? 1.6 : 0.6,
  }
})

// eases the mm readout toward the selected case size
function useTween(target: number, duration = 500) {
  const [value, setValue] = useState(target)
  const valueRef = useRef(target)

  useEffect(() => {
    const from = valueRef.current
    const t0 = performance.now()
    let raf = 0
    const step = (t: number) => {
      const k = Math.max(0, Math.min(1, (t - t0) / duration))
      const eased = 1 - Math.pow(1 - k, 3)
      valueRef.current = Math.round(from + (target - from) * eased)
      setValue(valueRef.current)
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

export function SizeGuide() {
  const [selected, setSelected] = useState(1)
  const current = sizes[selected]
  const shownMm = useTween(current.mm)
  const [from, to] = current.range
  const casePct = `${Math.round((current.mm / 44) * 52)}%`

  return (
    <section
      id="advisor"
      className="border-y-4 bg-surface-container"
      aria-labelledby="size-guide-title"
    >
      <div
        className={cn(
          gutter,
          "grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] items-center gap-16 py-32"
        )}
      >
        <Reveal>
          <span className={`${eyebrow} mb-4`}>
            03 — Wrist &amp; Scale Guide
          </span>
          <h2 id="size-guide-title" className={sectionTitle}>
            See it on your wrist before it arrives.
          </h2>
          <p className="mt-6 max-w-[520px] font-sans text-[22px] leading-8 text-pretty text-muted-foreground">
            Pick a case diameter. The guide shows how it sits on the wrist and
            which wrist sizes it suits.
          </p>

          <div
            role="group"
            aria-label="Case diameter"
            className="relative mt-10 grid grid-cols-4 border-4"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 z-[2] h-1.5 w-1/4 bg-gold transition-[left] duration-[450ms] ease-xii"
              style={{ left: `${selected * 25}%` }}
            />
            {sizes.map((size, i) => (
              <button
                key={size.mm}
                type="button"
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
                className={cn(
                  "-mr-1 h-16 border-r-4 font-heading text-lg leading-6 font-bold tracking-[1.5px] transition-colors duration-[250ms]",
                  selected === i
                    ? "bg-foreground text-black"
                    : "bg-background text-foreground"
                )}
              >
                {size.mm}mm
              </button>
            ))}
          </div>

          <p className="mt-4 font-heading text-sm leading-6 font-bold tracking-[1.5px] uppercase">
            Suits wrists <span className="text-gold">{current.wrist}</span>
          </p>

          <div className="mt-5">
            <div className="relative h-5 border-4 bg-background">
              <span
                className="absolute inset-y-0 bg-gold transition-[left,width] duration-[550ms] ease-xii"
                style={{
                  left: `${((from - 13) / 8) * 100}%`,
                  width: `${((to - from) / 8) * 100}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
              <span>13 CM</span>
              <span>15</span>
              <span>17</span>
              <span>19</span>
              <span>21 CM</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div
            role="img"
            aria-label={`${current.mm}mm case shown at 1:1 scale on a wrist`}
            className="relative flex aspect-square items-center justify-center overflow-hidden border-4 bg-card"
          >
            <div className={cn(gridBackdrop, "opacity-[.08]")} />
            <div className="absolute inset-x-0 top-1/2 h-[38%] -translate-y-1/2 border-y-4 border-surface-variant bg-surface-container" />
            <div
              className="absolute top-1/2 left-1/2 h-[44%] -translate-x-1/2 -translate-y-1/2 border-x-4 border-surface-variant bg-black transition-[width] duration-500 ease-xii"
              style={{ width: casePct }}
            />

            <div
              className="circle relative flex aspect-square items-center justify-center border-4 border-foreground bg-background transition-[width] duration-[600ms] ease-[cubic-bezier(.34,1.4,.5,1)]"
              style={{ width: casePct }}
            >
              <svg
                viewBox="0 0 100 100"
                fill="none"
                className="absolute inset-[6%] size-[88%] animate-[xii-spin_60s_linear_infinite] motion-reduce:animate-none"
              >
                {caseTicks.map((t, i) => (
                  <line
                    key={i}
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke={t.stroke}
                    strokeWidth={t.width}
                  />
                ))}
              </svg>
              <span className="absolute bottom-1/2 left-1/2 -ml-px h-[40%] w-0.5 origin-bottom animate-[xii-spin_6s_steps(60)_infinite] bg-gold motion-reduce:animate-none" />
              <span className="circle pointer-events-none absolute -inset-1 animate-[xii-ping_2.4s_cubic-bezier(.2,.7,.2,1)_infinite] border-2 border-gold motion-reduce:animate-none" />
              <div className="circle relative size-3 bg-gold" />
              <div className="absolute top-[calc(100%+28px)] -right-1 -left-1 h-3 border-x-2 border-gold">
                <span className="absolute inset-x-0 top-[5px] h-0.5 bg-gold" />
                <span className="absolute top-[18px] left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.1em] whitespace-nowrap text-gold">
                  Ø {current.mm}mm
                </span>
              </div>
            </div>

            <span className="absolute top-5 left-5 font-mono text-xs tracking-[0.1em] text-muted-foreground">
              SCALE 1:1 — CASE Ø
            </span>
            <span className="absolute right-5 bottom-5 font-heading text-[40px] leading-none font-bold tracking-[-0.02em] tabular-nums">
              {shownMm}mm
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
