import { eyebrow, sectionTitle, textLink } from "./styles"
import { ScrollLink } from "./scroll-link"

export function SectionHeader({
  eyebrowText,
  title,
  href,
  linkLabel,
}: {
  eyebrowText: string
  title: string
  href: string
  linkLabel: string
}) {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b-4 pb-8">
      <div>
        <span className={`${eyebrow} mb-2`}>{eyebrowText}</span>
        <h2 className={sectionTitle}>{title}</h2>
      </div>
      <ScrollLink href={href} className={`${textLink} border-foreground`}>
        {linkLabel}
      </ScrollLink>
    </div>
  )
}
