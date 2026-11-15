import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { SkipLink } from "@/components/layout/skip-link"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark flex min-h-svh flex-col bg-background text-foreground">
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="relative flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
