import {
  CONDITION_LABEL,
  GENDER_LABEL,
  MOVEMENT_LABEL,
} from "@/app/(app)/watches/[id]/_utils/labels"
import type { WatchDetail } from "@/app/(app)/watches/[id]/_data/types"
import { monoCaption } from "@/components/home/styles"
import { cn } from "@/lib/utils"

import { WatchDescription } from "./watch-description"

function specRows(w: WatchDetail) {
  const rows: [string, string | null][] = [
    ["Movement", w.movement && MOVEMENT_LABEL[w.movement]],
    ["Caliber", w.caliber],
    ["Case material", w.caseMaterial],
    ["Gender", w.gender && GENDER_LABEL[w.gender]],
    ["Condition", w.condition && CONDITION_LABEL[w.condition]],
    ["Reference", w.model],
  ]
  return rows.filter((r): r is [string, string] => Boolean(r[1]))
}

/** "The Piece" description beside the specifications table. */
export function WatchDetails({ watch }: { watch: WatchDetail }) {
  return (
    <div className="grid border-4 border-foreground lg:grid-cols-[3fr_2fr]">
      <div className="border-b-4 border-foreground p-6 sm:p-10 lg:border-r-4 lg:border-b-0">
        <span className={cn(monoCaption, "mb-5 block")}>THE PIECE</span>
        <WatchDescription text={watch.description} />
      </div>

      <div className="p-6 sm:p-10">
        <span className={cn(monoCaption, "mb-2 block")}>SPECIFICATIONS</span>
        <dl>
          {specRows(watch).map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 border-b-2 border-surface-variant py-4"
            >
              <dt className="font-sans text-[13px] tracking-widest text-steel uppercase">
                {label}
              </dt>
              <dd className="text-right font-heading text-lg font-semibold">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
