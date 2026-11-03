import { Anatomy } from "@/components/home/anatomy"
import { Collectors } from "@/components/home/collectors"
import { Cta } from "@/components/home/cta"
import { CuratedDrop } from "@/components/home/curated-drop"
import { Footer } from "@/components/home/footer"
import { Hero } from "@/components/home/hero"
import { Nav } from "@/components/home/nav"
import { SizeGuide } from "@/components/home/size-guide"

import { getFeaturedWatches } from "./(app)/watches/_data/catalog"

export default async function Page() {
  const watches = await getFeaturedWatches(3)

  return (
    <div className="dark bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <CuratedDrop watches={watches} />
        <SizeGuide />
        <Anatomy />
        <Collectors />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
