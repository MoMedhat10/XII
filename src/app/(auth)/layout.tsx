import * as React from "react"
import { BackToHome } from "@/components/auth/back-to-home"
import { HorologyBlueprint } from "@/components/auth/horology-blueprint"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f3f3f4] dark:bg-[#141515] text-foreground flex flex-col justify-center relative p-4 sm:p-8 lg:p-12 overflow-x-hidden">
      {/* Background Architectural Micro-Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.045] dark:opacity-[0.06] select-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient Luxury Gold Radial Illumination */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] lg:size-[850px] rounded-full bg-[#B08D57]/[0.07] dark:bg-[#B08D57]/[0.10] blur-[120px] pointer-events-none select-none" />

      {/* Architectural Corner Registration Crosshairs */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-xs font-mono text-muted-foreground/40 pointer-events-none select-none">
        +
      </div>
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-xs font-mono text-muted-foreground/40 pointer-events-none select-none">
        +
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 text-xs font-mono text-muted-foreground/40 pointer-events-none select-none">
        +
      </div>

      {/* Top Left Navigation Link to Home */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-30">
        <BackToHome />
      </div>

      {/* Main 12-Column Architectural Composition */}
      <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-16 lg:pt-0 relative z-10">
        {/* Left: Horological Caliber Blueprint & Display Typography */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7">
          <HorologyBlueprint />
        </div>

        {/* Right: Dedicated Form Container */}
        <div className="lg:col-span-6 xl:col-span-5 flex justify-center items-center">
          {children}
        </div>
      </div>
    </div>
  )
}
