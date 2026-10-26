// UI state shapes shared by the hooks and the components they drive. They
// live here so hooks never import from component files.
import type { AdminBrand, AdminWatch } from "../_data/types"
import type { FieldErrors } from "../_utils/action-result"

export type WatchDrawerState =
  { mode: "create"; brandId: string } | { mode: "edit"; watch: AdminWatch }

export type BrandDialogState = {
  brand: AdminBrand | null
  /** Opened from the watch drawer: the new brand gets selected there. */
  fromWatch: boolean
}

export type DeleteTarget =
  | { kind: "watch"; id: string; name: string }
  | { kind: "brand"; id: string; name: string }
  | {
      kind: "image"
      id: string
      name: string
      watchId: string
      url: string
      position: number
      isCover: boolean
      isLastOfLive: boolean
    }

/** A failed save: shown under the matching fields, otherwise as a toast. */
export type ServerError = { message: string; fieldErrors?: FieldErrors }

/** What a form's useActionState holds: the opening it belongs to + any error. */
export type FormResult = { openId: number; error?: ServerError }
