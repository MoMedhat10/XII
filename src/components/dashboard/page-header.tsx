import { Fragment } from "react"

import { cn } from "@/lib/utils"

/** Title block every admin page starts with: breadcrumb, eyebrow, title, actions. */
export function PageHeader({
  crumbs,
  eyebrow,
  title,
  actions,
  className,
}: {
  crumbs: string[]
  eyebrow?: React.ReactNode
  title: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-end justify-between gap-6 border-b-4 pb-7",
        className
      )}
    >
      <div className="flex min-w-0 flex-auto flex-col gap-2">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[1px] text-muted-foreground uppercase"
        >
          {crumbs.map((crumb, i) => (
            <Fragment key={crumb}>
              {i > 0 && <span aria-hidden="true">/</span>}
              <span
                aria-current={i === crumbs.length - 1 ? "page" : undefined}
                className={cn(i === crumbs.length - 1 && "text-foreground")}
              >
                {crumb}
              </span>
            </Fragment>
          ))}
        </nav>
        {eyebrow && (
          <span className="font-heading text-sm leading-6 font-bold tracking-[1.5px] whitespace-nowrap text-gold uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="font-heading text-[clamp(40px,5vw,72px)] leading-none font-bold tracking-[-0.02em]">
          {title}
        </h1>
      </div>

      {actions && (
        <div className="flex w-full flex-wrap gap-3 sm:w-auto">{actions}</div>
      )}
    </header>
  )
}
