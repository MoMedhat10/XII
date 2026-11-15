/** First focusable element on every page: jumps keyboard users past the header. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only border-4 border-foreground bg-foreground px-4 py-2 font-sans text-xs font-bold tracking-[1.5px] text-black uppercase focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]"
    >
      Skip to content
    </a>
  )
}
