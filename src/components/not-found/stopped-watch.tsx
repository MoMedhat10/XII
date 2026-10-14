"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const caption = "absolute font-mono text-[11px] tracking-[.2em]"

const ticks = Array.from({ length: 60 }, (_, i) => ({
  angle: i * 6,
  hour: i % 5 === 0,
}))

const handTransition = "transform 2.2s cubic-bezier(.6,0,.2,1)"

// A watch frozen at 4:04. The hands sweep in on mount, the dial shudders
// once, and hovering it twitches the seconds hand.
export function StoppedWatch() {
  const [landed, setLanded] = useState(false)
  const [shudder, setShudder] = useState(false)
  const [twitch, setTwitch] = useState(false)
  const twitchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  useEffect(() => {
    const land = setTimeout(() => setLanded(true), 300)
    const shud = setTimeout(() => setShudder(true), 2500)
    return () => {
      clearTimeout(land)
      clearTimeout(shud)
      clearTimeout(twitchTimer.current)
    }
  }, [])

  const onTwitch = () => {
    if (!landed) return
    clearTimeout(twitchTimer.current)
    setTwitch(true)
    twitchTimer.current = setTimeout(() => setTwitch(false), 160)
  }

  return (
    <div
      aria-hidden="true"
      onMouseEnter={onTwitch}
      className={cn(
        "relative aspect-square w-[min(520px,100%)] justify-self-center border-4 bg-background",
        shudder && "animate-[xii-shud_.18s_linear_2] motion-reduce:animate-none"
      )}
    >
      <span className={cn(caption, "top-4 left-4 text-muted-foreground")}>
        CAL. XII-404
      </span>
      <span className={cn(caption, "top-4 right-4 text-gold")}>● STOPPED</span>
      <span className={cn(caption, "bottom-4 left-4 text-muted-foreground")}>
        RESERVE 0 H
      </span>
      <span className={cn(caption, "right-4 bottom-4 text-muted-foreground")}>
        04:04:00
      </span>

      <div className="circle absolute inset-[12%] border-4">
        <div className="circle absolute inset-[6%] border-2 border-dashed border-surface-variant" />

        {ticks.map((t) => (
          <div
            key={t.angle}
            className="absolute top-0 left-1/2 h-1/2 w-0 origin-bottom"
            style={{ transform: `rotate(${t.angle}deg)` }}
          >
            <span
              className={cn(
                "absolute top-[3%]",
                t.hour
                  ? "-left-[3px] h-[22px] w-[6px] bg-foreground"
                  : "-left-px h-2.5 w-0.5 bg-surface-variant"
              )}
            />
          </div>
        ))}

        <span className="absolute top-[14%] left-1/2 -translate-x-1/2 font-heading text-[clamp(18px,2.4vw,28px)] leading-none font-bold">
          XII
        </span>

        <div
          className="absolute bottom-1/2 left-1/2 -ml-[5px] h-[26%] w-2.5 origin-bottom bg-foreground motion-reduce:transition-none!"
          style={{
            transform: `rotate(${landed ? 122 : -238}deg)`,
            transition: handTransition,
          }}
        />
        <div
          className="absolute bottom-1/2 left-1/2 -ml-[3px] h-[38%] w-1.5 origin-bottom bg-foreground motion-reduce:transition-none!"
          style={{
            transform: `rotate(${landed ? 24 : -696}deg)`,
            transition: handTransition,
          }}
        />
        <div
          className="absolute bottom-1/2 left-1/2 -ml-px h-[42%] w-0.5 origin-bottom bg-gold motion-reduce:transition-none!"
          style={{
            transform: `rotate(${(landed ? 0 : -360) + (twitch ? 3 : 0)}deg)`,
            transition: twitch ? "transform .08s steps(1)" : handTransition,
          }}
        />
        <div className="circle absolute top-1/2 left-1/2 -mt-2.5 -ml-2.5 size-5 border-4 border-[#141515] bg-gold" />
      </div>
    </div>
  )
}
