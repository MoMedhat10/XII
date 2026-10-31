import { Anatomy } from "@/components/home/anatomy"
import { Collectors } from "@/components/home/collectors"
import { Cta } from "@/components/home/cta"
import { CuratedDrop } from "@/components/home/curated-drop"
import { Footer } from "@/components/home/footer"
import { Hero } from "@/components/home/hero"
import { Nav } from "@/components/home/nav"
import { SizeGuide } from "@/components/home/size-guide"
import prisma from "../../lib/prisma"


export default async function Page() {
  const watches = await prisma.watch.findMany({
    where: { isActive: true },
    select: {
      name: true,
      model: true,
      priceCents: true,
      caliber: true,
      caseMaterial: true,
      images: true
    },
  });
  
  return (
    <div className="dark bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <CuratedDrop watches={watches.slice(0,3)} />
        <SizeGuide />
        <Anatomy />
        <Collectors />
        <Cta />
      </main>
      <Footer />
    </div>
  )
}
