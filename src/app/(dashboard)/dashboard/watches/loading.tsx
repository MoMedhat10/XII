import { WatchesHeader } from "@/components/dashboard/watches/watches-header"
import { WatchesLoading } from "@/components/dashboard/watches/watches-states"

export default function Loading() {
  return (
    <>
      <WatchesHeader total={null} brandCount={null} disabled />
      <WatchesLoading />
    </>
  )
}
