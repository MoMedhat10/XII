"use client"

import { useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000)
  return () => clearInterval(id)
}

const getSnapshot = () => Math.floor(Date.now() / 1000)
const getServerSnapshot = () => null

// null on the server and during hydration, so markup always matches
function useNow() {
  const seconds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  return seconds === null ? null : new Date(seconds * 1000)
}

const pad = (n: number) => String(n).padStart(2, "0")

export function LiveTime() {
  const now = useNow()
  return (
    <span className="mb-4 font-heading text-sm leading-6 font-bold tracking-[1.5px] text-gold uppercase tabular-nums">
      Your time —{" "}
      {now
        ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
        : "--:--:--"}
    </span>
  )
}

export function LiveHands() {
  const now = useNow()
  const h = now?.getHours() ?? 0
  const m = now?.getMinutes() ?? 0
  const s = now?.getSeconds() ?? 0

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      fill="none"
      strokeLinecap="square"
      className={cn(
        "absolute aspect-square w-[min(640px,88vw)] overflow-visible transition-opacity duration-700",
        now ? "opacity-100" : "opacity-0"
      )}
    >
      <line
        x1="200"
        y1="200"
        x2="200"
        y2="110"
        stroke="#4c4546"
        strokeWidth="8"
        transform={`rotate(${(h % 12) * 30 + m * 0.5} 200 200)`}
      />
      <line
        x1="200"
        y1="200"
        x2="200"
        y2="70"
        stroke="#4c4546"
        strokeWidth="5"
        transform={`rotate(${m * 6 + s * 0.1} 200 200)`}
      />
      <line
        x1="200"
        y1="225"
        x2="200"
        y2="40"
        stroke="#B08D57"
        strokeWidth="2"
        opacity="0.45"
        transform={`rotate(${s * 6} 200 200)`}
      />
      <rect
        x="194"
        y="194"
        width="12"
        height="12"
        fill="#B08D57"
        opacity="0.6"
      />
    </svg>
  )
}
