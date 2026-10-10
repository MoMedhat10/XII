"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

import { cn } from "@/lib/utils"

type ImageFallbackProps = Omit<ImageProps, "onError" | "src"> & {
  src?: ImageProps["src"]
  label?: string
  chip?: string
  wrapperClassName?: string
}

export function ImageFallback({
  src,
  label = "Timepiece Photography",
  chip,
  wrapperClassName,
  alt,
  ...props
}: ImageFallbackProps) {
  const [failed, setFailed] = useState(false)
  const showFallback = failed || !src

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        showFallback &&
          "bg-[repeating-linear-gradient(135deg,#232525_0_10px,#1b1b1b_10px_20px)]",
        wrapperClassName
      )}
    >
      {showFallback ? (
        <span
          role="img"
          aria-label={alt}
          className="bg-[#1b1b1b] px-2.5 py-1.5 font-mono text-xs tracking-[0.1em] text-[#cfc4c5] uppercase"
        >
          {label}
        </span>
      ) : (
        <Image {...props} src={src} alt={alt} onError={() => setFailed(true)} />
      )}
      {chip && (
        <span className="absolute top-4 left-4 border-2 border-black bg-white px-2.5 py-1 font-heading text-[11px] leading-4 font-bold tracking-[1.5px] text-black uppercase">
          {chip}
        </span>
      )}
    </div>
  )
}
