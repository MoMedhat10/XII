"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,translate] duration-[900ms] ease-xii",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none print:translate-y-0 print:opacity-100",
        shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        className
      )}
    >
      {children}
    </div>
  )
}
