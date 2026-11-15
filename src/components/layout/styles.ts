// Shared by the site header, account menu and mobile menu.

/** A 40px square or pill action with the heavy 4px border. */
export const action =
  "inline-flex h-10 items-center justify-center border-4 border-foreground transition-colors"

/** Outline action: inverts on hover. */
export const actionOutline =
  "bg-background hover:bg-foreground hover:text-black"

/** Solid action: the primary call (bag, register). */
export const actionSolid =
  "bg-foreground text-black hover:bg-background hover:text-foreground"

/** Text inside a pill action. */
export const actionText =
  "px-4 font-sans text-xs font-bold tracking-[1.5px] uppercase"
