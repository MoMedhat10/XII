"use client"

import { useId, useMemo, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import type { AdminBrand } from "@/app/(dashboard)/_data/mock-watches"
import {
  brandLogoFileSchema,
  createBrandFormSchema,
  type BrandFormInput,
} from "@/app/(dashboard)/_utils/watch-schema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

import { BrandLogo } from "./brands-drawer"
import {
  btn,
  btnGold,
  btnOutline,
  closeBtn,
  eyebrowSm,
  fieldControl,
  fieldError,
  fieldLabel,
  portalTheme,
} from "./watch-utils"
import { BRAND_LOGO_TYPES } from "@/app/(dashboard)/_utils/upload-rules"

export type BrandDialogState = {
  brand: AdminBrand | null
  /** Opened from the watch drawer: the new brand gets selected there. */
  fromWatch: boolean
}

export function BrandDialog({
  open,
  state,
  brands,
  saving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  state: BrandDialogState
  brands: AdminBrand[]
  saving: boolean
  onOpenChange: (open: boolean) => void
  /** Resolves when saved; throws to keep the dialog open. */
  onSubmit: (values: BrandFormInput) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          portalTheme,
          "max-h-[calc(100dvh-32px)] w-[min(500px,calc(100vw-32px))] max-w-none gap-5 overflow-y-auto bg-background p-6 text-sm shadow-[12px_12px_0_var(--gold)] sm:max-w-none sm:p-7"
        )}
      >
        <BrandForm
          state={state}
          brands={brands}
          saving={saving}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

function BrandForm({
  state,
  brands,
  saving,
  onSubmit,
}: {
  state: BrandDialogState
  brands: AdminBrand[]
  saving: boolean
  onSubmit: (values: BrandFormInput) => Promise<void>
}) {
  const uid = useId()
  const logoInput = useRef<HTMLInputElement>(null)
  const editing = state.brand !== null

  const schema = useMemo(
    () => createBrandFormSchema(brands, state.brand?.id ?? null),
    [brands, state.brand]
  )

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: state.brand?.name ?? "",
      description: state.brand?.description ?? "",
      logoUrl: state.brand?.logoUrl ?? null,
      logoFile: null,
    },
  })

  const revokePreview = (url: string | null) => {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
  }

  const busy = isSubmitting || saving

  const submit = async (values: BrandFormInput) => {
    try {
      await onSubmit(values)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.")
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      aria-busy={busy}
      className="flex flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className={eyebrowSm}>
            {editing ? "Edit maison" : "New maison"}
          </span>
          <DialogTitle className="font-heading text-[32px] leading-[1.1] font-bold tracking-[-0.02em]">
            {editing ? "Edit brand" : "New brand"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Brand name, description and logo.
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close"
            disabled={busy}
            className={closeBtn}
          >
            ✕
          </button>
        </DialogClose>
      </div>

      <fieldset disabled={busy} className="flex flex-col gap-5">
        <Controller
          control={control}
          name="logoUrl"
          render={({ field, fieldState }) => (
            <div className="flex items-center gap-[18px]">
              <button
                type="button"
                onClick={() => logoInput.current?.click()}
                aria-label={field.value ? "Replace logo" : "Upload logo"}
                aria-describedby={fieldState.error ? `${uid}-logo-error` : undefined}
                className={cn(
                  "circle flex size-24 shrink-0 items-center justify-center overflow-hidden border-[3px] border-dashed border-gold bg-[#141515] font-heading text-[11px] font-bold tracking-[1px] text-gold transition-colors hover:border-foreground hover:text-foreground",
                  fieldState.error && "border-destructive text-destructive"
                )}
              >
                {field.value ? (
                  <BrandLogo
                    brand={{ name: "", logoUrl: field.value }}
                    className="size-full border-0"
                  />
                ) : (
                  "LOGO ↑"
                )}
              </button>
              <div className="flex flex-col gap-1">
                <span className="text-[15px] font-semibold">Brand logo *</span>
                <span className="text-[13px] leading-[1.4] text-muted-foreground">
                  SVG or PNG on transparent. Shown on cards and filters.
                </span>
                {fieldState.error && (
                  <span id={`${uid}-logo-error`} role="alert" className={fieldError}>
                    {fieldState.error.message}
                  </span>
                )}
              </div>
              <input
                ref={logoInput}
                type="file"
                accept={BRAND_LOGO_TYPES.join(",")}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (!file) return
                  const result = brandLogoFileSchema.safeParse(file)
                  if (!result.success) {
                    toast.error(result.error.issues[0]?.message)
                    return
                  }
                  revokePreview(field.value)
                  setValue("logoFile", file)
                  // preview; also clears the "Logo is required." error
                  setValue("logoUrl", URL.createObjectURL(file), { shouldValidate: true })
                }}
              />
            </div>
          )}
        />

        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>Name</span>
          <Input
            placeholder="e.g. Atelier Nord"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            className={cn(fieldControl, "font-heading text-lg font-semibold")}
            {...register("name")}
          />
          {errors.name && (
            <span id={`${uid}-name-error`} role="alert" className={fieldError}>
              {errors.name.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>Description</span>
          <textarea
            rows={4}
            placeholder="Origin, house style…"
            aria-invalid={errors.description ? true : undefined}
            className={cn(
              fieldControl,
              "h-auto resize-y py-3 leading-6 outline-none"
            )}
            {...register("description")}
          />
          {errors.description && (
            <span role="alert" className={fieldError}>
              {errors.description.message}
            </span>
          )}
        </label>
      </fieldset>

      <div className="flex gap-3">
        <DialogClose asChild>
          <Button
            type="button"
            disabled={busy}
            className={cn(btn, btnOutline, "flex-1 px-4")}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={busy}
          className={cn(btn, btnGold, "flex-1 px-4")}
        >
          {busy && <Spinner aria-hidden="true" />}
          {busy
            ? "Saving…"
            : editing
              ? "Save brand"
              : state.fromWatch
                ? "Create & select"
                : "Create brand"}
        </Button>
      </div>
    </form>
  )
}
