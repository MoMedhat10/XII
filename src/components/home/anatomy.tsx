"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

import { Reveal } from "./reveal"
import { SectionHeader } from "./section-header"
import { gridBackdrop, gutter } from "./styles"

const layers = [
  {
    title: "Case",
    body: "Machined from a single titanium or steel billet, then brushed flat. Sharp chamfers, no polish.",
    img: "LAYER 01 — CASE",
    scale: 1,
    inner: "70%",
  },
  {
    title: "Dial",
    body: "Open-worked so the movement reads through. Markers are cut, never printed.",
    img: "LAYER 02 — DIAL",
    scale: 0.92,
    inner: "55%",
  },
  {
    title: "Caliber",
    body: "In-house movement, assembled and regulated by one watchmaker from start to finish.",
    img: "LAYER 03 — CALIBER",
    scale: 0.82,
    inner: "40%",
  },
  {
    title: "Crystal",
    body: "Sapphire ground flat and edge-polished — a clean section through the case.",
    img: "LAYER 04 — SAPPHIRE",
    scale: 1,
    inner: "85%",
  },
]

const GOLD = "#B08D57"
const INACTIVE = "#4c4546"

export function Anatomy() {
  const [{ layer, prog }, setState] = useState({ layer: 0, prog: 0 })

  // auto-advance: progress fills over ~6s, then moves to the next layer
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) =>
        s.prog >= 100
          ? { layer: (s.layer + 1) % layers.length, prog: 0 }
          : { ...s, prog: s.prog + 1 }
      )
    }, 60)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="craft">
      <div className={cn(gutter, "py-32")}>
        <Reveal>
          <SectionHeader
            eyebrowText="04 — Anatomy of a XII"
            title="Four layers. Nothing extra."
            href="/#craft"
            linkLabel="Read the Manifesto →"
          />
        </Reveal>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-stretch gap-12">
          <div className="flex flex-col divide-y-4 border-4">
            {layers.map((l, i) => {
              const on = layer === i
              return (
                <Reveal key={l.title} delay={i * 100}>
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => setState({ layer: i, prog: 0 })}
                    className={cn(
                      "relative flex w-full flex-col gap-2.5 px-8 py-7 text-left transition-colors hover:bg-card",
                      on ? "bg-card" : "bg-background"
                    )}
                  >
                    <span className="flex items-baseline gap-5">
                      <span
                        className="font-heading text-[32px] leading-none font-bold transition-colors duration-300"
                        style={{ color: on ? GOLD : INACTIVE }}
                      >
                        0{i + 1}
                      </span>
                      <span
                        className={cn(
                          "font-heading text-[28px] leading-[34px] font-semibold transition-transform duration-[400ms] ease-xii",
                          on && "translate-x-2"
                        )}
                      >
                        {l.title}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "grid transition-[grid-template-rows] duration-500 ease-xii",
                        on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <span className="min-h-0 overflow-hidden">
                        <span
                          className={cn(
                            "block max-w-[460px] font-sans text-lg leading-7 text-pretty text-muted-foreground transition-[opacity,translate] delay-100 duration-500 ease-xii",
                            on
                              ? "translate-y-0 opacity-100"
                              : "-translate-y-2 opacity-0"
                          )}
                        >
                          {l.body}
                        </span>
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-1 bg-gold"
                      style={{ width: on ? `${prog}%` : "0%" }}
                    />
                  </button>
                </Reveal>
              )
            })}
          </div>

          <Reveal delay={160} className="h-full">
            <div
              role="img"
              aria-label={`Exploded view of the watch, highlighting the ${layers[layer].title.toLowerCase()} layer`}
              className="relative h-full min-h-[520px] overflow-hidden border-4 bg-surface-container"
            >
              <div className={cn(gridBackdrop, "opacity-[.07]")} />

              <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
                <div
                  className="relative aspect-square w-[min(300px,60%)]"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "rotateX(58deg) rotateZ(-32deg)",
                  }}
                >
                  {layers
                    .map((l, i) => {
                      const on = layer === i
                      const color = on ? GOLD : "#f9f9f9"
                      const z = (3 - i) * 70 + (on ? 30 : 0)
                      return (
                        <div
                          key={l.title}
                          className="circle absolute inset-0 flex items-center justify-center border-solid transition-[transform,opacity,border-color,background-color] duration-[800ms] ease-xii"
                          style={{
                            borderWidth: on ? 4 : 2,
                            borderColor: color,
                            background: on
                              ? "rgba(176,141,87,.12)"
                              : "rgba(26,28,28,.6)",
                            transform: `translateZ(${z}px) scale(${l.scale})`,
                            opacity: on ? 1 : 0.55,
                          }}
                        >
                          <span
                            className="circle aspect-square border-2 border-dashed opacity-60"
                            style={{ width: l.inner, borderColor: color }}
                          />
                        </div>
                      )
                    })
                    .reverse()}
                </div>
              </div>

              <div className="absolute top-16 right-5 flex flex-col items-end gap-2.5">
                {layers
                  .map((l, i) => {
                    const on = layer === i
                    return (
                      <span
                        key={l.title}
                        className="flex items-center gap-2.5 font-mono text-xs tracking-[0.1em] uppercase transition-colors duration-300"
                        style={{ color: on ? GOLD : INACTIVE }}
                      >
                        {l.title}
                        <span
                          className="block h-0.5 transition-[width,background-color] duration-500 ease-xii"
                          style={{
                            width: on ? 48 : 16,
                            background: on ? GOLD : INACTIVE,
                          }}
                        />
                      </span>
                    )
                  })
                  .reverse()}
              </div>

              <span className="absolute top-5 left-5 font-mono text-xs tracking-[0.1em] text-muted-foreground">
                EXPLODED VIEW — {layers[layer].img}
              </span>

              <div className="absolute right-5 bottom-4 h-[72px] overflow-hidden">
                <div
                  className="flex flex-col transition-transform duration-[600ms] ease-xii"
                  style={{ transform: `translateY(${-72 * layer}px)` }}
                >
                  {layers.map((l, i) => (
                    <span
                      key={l.title}
                      className="h-[72px] font-heading text-[72px] leading-[72px] font-bold tracking-[-0.02em] text-gold"
                    >
                      0{i + 1}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-6 left-5 flex gap-1.5">
                {layers.map((l, i) => (
                  <span
                    key={l.title}
                    className="h-1.5 transition-[width,background-color] duration-[400ms] ease-xii"
                    style={{
                      width: layer === i ? 32 : 10,
                      background: layer === i ? GOLD : INACTIVE,
                    }}
                  />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
