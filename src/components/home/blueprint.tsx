import { cn } from "@/lib/utils"

const markers = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180
  return {
    x1: (200 + 165 * Math.sin(a)).toFixed(2),
    y1: (200 - 165 * Math.cos(a)).toFixed(2),
    x2: (200 + 175 * Math.sin(a)).toFixed(2),
    y2: (200 - 175 * Math.cos(a)).toFixed(2),
  }
})

const layer = "absolute inset-0 size-full"

export function Blueprint({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative aspect-square text-foreground", className)}
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className={cn(
          layer,
          "animate-[xii-spin_120s_linear_infinite] motion-reduce:animate-none"
        )}
      >
        <circle cx="200" cy="200" r="185" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="175" strokeDasharray="4 4" />
        <circle cx="200" cy="200" r="158" />
        {markers.map((m, i) => (
          <line key={i} {...m} stroke="currentColor" strokeWidth="2.5" />
        ))}
      </svg>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className={cn(
          layer,
          "animate-[xii-spin_45s_linear_infinite_reverse] motion-reduce:animate-none"
        )}
      >
        <circle cx="200" cy="200" r="115" strokeDasharray="6 3" />
        <circle cx="150" cy="225" r="50" strokeWidth="1.5" />
        <circle cx="150" cy="225" r="42" strokeDasharray="3 3" />
        <circle cx="245" cy="180" r="35" strokeWidth="1.5" />
        <circle cx="245" cy="180" r="8" fill="#B08D57" opacity="0.6" />
        <path
          d="M 120 180 Q 200 130 280 180"
          strokeWidth="2"
          stroke="#B08D57"
          opacity="0.8"
        />
        <path d="M 100 230 Q 200 290 300 230" strokeWidth="1.8" />
      </svg>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={cn(
          layer,
          "animate-[xii-pulse_2s_cubic-bezier(.4,0,.6,1)_infinite] motion-reduce:animate-none"
        )}
      >
        <circle cx="200" cy="200" r="16" stroke="#B08D57" strokeWidth="2" />
        <circle cx="200" cy="200" r="6" fill="#B08D57" opacity="0.8" />
        <line
          x1="200"
          y1="50"
          x2="200"
          y2="350"
          strokeDasharray="2 4"
          opacity="0.4"
        />
        <line
          x1="50"
          y1="200"
          x2="350"
          y2="200"
          strokeDasharray="2 4"
          opacity="0.4"
        />
      </svg>
    </div>
  )
}
