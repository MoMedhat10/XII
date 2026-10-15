import { BackButton } from "@/components/back-button"
import { gutter } from "@/components/home/styles"
import { AppFooter } from "@/components/wishlist/app-footer"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark bg-background text-foreground">
      <main className="relative min-h-[calc(100vh-88px)]">
        <div className="pointer-events-none absolute inset-x-0 top-6 z-10">
          <div className={gutter}>
            <BackButton className="pointer-events-auto" />
          </div>
        </div>
        {children}
      </main>
      <AppFooter />
    </div>
  )
}
