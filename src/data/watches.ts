import "server-only"
import prisma from "../../lib/prisma"

export type WatchCard = {
  id: string
  name: string
  brandName: string
  priceCents: number
  imageUrl: string | null
}

export const getActiveWatches = async (): Promise<WatchCard[]> => {
  const watches = await prisma.watch.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      priceCents: true,
      brand: { select: { name: true } },
      images: {
        select: { url: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return watches.map((w) => ({
    id: w.id,
    name: w.name,
    brandName: w.brand.name,
    priceCents: w.priceCents,
    imageUrl: w.images[0]?.url ?? null,
  }))
}
