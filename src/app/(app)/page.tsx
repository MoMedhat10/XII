import { Anatomy } from "@/components/home/anatomy"
import { Collectors } from "@/components/home/collectors"
import { Cta } from "@/components/home/cta"
import { CuratedDrop } from "@/components/home/curated-drop"
import { FooterDirectory } from "@/components/home/footer-directory"
import { Hero } from "@/components/home/hero"
import { SizeGuide } from "@/components/home/size-guide"

import { getFeaturedWatches } from "./watches/_data/catalog"

export default async function Page() {
  const watches = await getFeaturedWatches(3)

  return (
    <>
      <Hero />
      <CuratedDrop watches={watches} />
      <SizeGuide />
      <Anatomy />
      <Collectors />
      <Cta />
      <FooterDirectory />
    </>
  )
}
