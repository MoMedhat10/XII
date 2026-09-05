"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function BackToHome() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 border-2 border-black bg-background px-4 py-2 text-xs font-bold uppercase tracking-[1.5px] transition-all hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
    >
      <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
      <span>BACK TO HOME</span>
    </Link>
  )
}
