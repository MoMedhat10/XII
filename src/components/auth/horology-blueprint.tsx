

export function HorologyBlueprint() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[480px] lg:min-h-[580px] w-full select-none px-4 py-8">
      {/* Background Animated Watch Caliber Movement */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Ambient Luxury Gold Glow */}
        <div className="absolute size-72 sm:size-80 lg:size-96 rounded-full bg-[#B08D57]/10 dark:bg-[#B08D57]/15 blur-3xl" />

        {/* Watch Movement SVG Schematics */}
        <div className="relative size-72 sm:size-80 lg:size-96 text-foreground/25 dark:text-foreground/20 transition-opacity">
          {/* Layer 1: Outer Case & Dial Markers (Slow Clockwise Rotation) */}
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 size-full animate-[spin_120s_linear_infinite]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <circle cx="200" cy="200" r="185" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="175" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="158" />

            {/* Hour & Minute Markers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180
              const x1 = 200 + 165 * Math.sin(angle)
              const y1 = 200 - 165 * Math.cos(angle)
              const x2 = 200 + 175 * Math.sin(angle)
              const y2 = 200 - 175 * Math.cos(angle)
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
              )
            })}
          </svg>

          {/* Layer 2: Internal Caliber Gears & Escapement (Counter-Clockwise Rotation) */}
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 size-full animate-[spin_45s_linear_infinite_reverse]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            {/* Gear Train Bridges */}
            <circle cx="200" cy="200" r="115" strokeDasharray="6 3" />
            <circle cx="150" cy="225" r="50" strokeWidth="1.5" />
            <circle cx="150" cy="225" r="42" strokeDasharray="3 3" />
            <circle cx="245" cy="180" r="35" strokeWidth="1.5" />
            <circle cx="245" cy="180" r="8" fill="#B08D57" opacity="0.6" />

            {/* Caliber Bridges */}
            <path
              d="M 120 180 Q 200 130 280 180"
              strokeWidth="2"
              stroke="#B08D57"
              opacity="0.8"
            />
            <path
              d="M 100 230 Q 200 290 300 230"
              strokeWidth="1.8"
            />
          </svg>

          {/* Layer 3: Central Pivot & Glucydur Balance Wheel (Subtle Oscillating Pulse) */}
          <svg
            viewBox="0 0 400 400"
            className="absolute inset-0 size-full animate-pulse"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {/* Center Ruby Jewel */}
            <circle cx="200" cy="200" r="16" stroke="#B08D57" strokeWidth="2" />
            <circle cx="200" cy="200" r="6" fill="#B08D57" opacity="0.8" />

            {/* Fine Alignment Crosshairs */}
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
      </div>

      {/* Foreground Centered Brand Showcase */}
      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Roman Numeral Logo */}
        <h1 className="hero-text text-8xl sm:text-9xl lg:text-[10rem] font-bold tracking-tight text-foreground drop-shadow-sm leading-none">
          XII
        </h1>

        {/* Universal Luxury Production Tagline */}
        <div className="mt-3 flex items-center gap-3">
          <span className="h-px w-6 bg-[#B08D57]" />
          <p className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#B08D57] uppercase font-heading">
            HAUTE HORLOGERIE
          </p>
          <span className="h-px w-6 bg-[#B08D57]" />
        </div>

        <p className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase mt-2">
          THE LUXURY TIMEPIECE ARCHIVE • EST. 2026
        </p>
      </div>
    </div>
  )
}
