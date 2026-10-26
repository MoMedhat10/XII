"use client"

import { useId } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"

import type {
  AdminBrand,
  AdminWatch,
} from "@/app/(dashboard)/_data/mock-watches"
import {
  formatPriceInput,
  watchFormSchema,
  type WatchFormInput,
} from "@/app/(dashboard)/_utils/watch-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

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
  textLink,
} from "./watch-utils"
import { MAX_STOCK } from "@/app/(dashboard)/_utils/upload-rules"

export type WatchDrawerState =
  { mode: "create"; brandId: string } | { mode: "edit"; watch: AdminWatch }

function toDefaults(state: WatchDrawerState): WatchFormInput {
  if (state.mode === "create") {
    return {
      name: "",
      model: "",
      brandId: state.brandId,
      price: "",
      stock: 0,
      description: "",
    }
  }
  const { watch } = state
  return {
    name: watch.name,
    model: watch.model,
    brandId: watch.brandId,
    price: formatPriceInput(String(Math.round(watch.priceCents / 100))),
    stock: watch.stock,
    description: watch.description,
  }
}

export function WatchDrawer({
  open,
  state,
  brands,
  saving,
  onOpenChange,
  onSubmit,
  onCreateBrand,
  onDelete,
}: {
  open: boolean
  state: WatchDrawerState
  brands: AdminBrand[]
  saving: boolean
  onOpenChange: (open: boolean) => void
  /** Resolves when saved; throws to keep the drawer open. */
  onSubmit: (values: WatchFormInput) => Promise<void>
  /** Opens the brand dialog; the callback selects the brand it creates. */
  onCreateBrand: (select: (brand: AdminBrand) => void) => void
  onDelete: (watch: AdminWatch) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          portalTheme,
          "gap-0 bg-background p-0 text-sm data-[side=right]:w-full data-[side=right]:border-foreground data-[side=right]:sm:max-w-[540px]"
        )}
      >
        {/* Radix unmounts closed content, so every open starts fresh. */}
        <WatchForm
          state={state}
          brands={brands}
          saving={saving}
          onSubmit={onSubmit}
          onCreateBrand={onCreateBrand}
          onDelete={onDelete}
        />
      </SheetContent>
    </Sheet>
  )
}

function WatchForm({
  state,
  brands,
  saving,
  onSubmit,
  onCreateBrand,
  onDelete,
}: {
  state: WatchDrawerState
  brands: AdminBrand[]
  saving: boolean
  onSubmit: (values: WatchFormInput) => Promise<void>
  onCreateBrand: (select: (brand: AdminBrand) => void) => void
  onDelete: (watch: AdminWatch) => void
}) {
  const uid = useId()
  const id = (name: string) => `${uid}-${name}`
  const editing = state.mode === "edit"

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WatchFormInput>({
    resolver: zodResolver(watchFormSchema),
    defaultValues: toDefaults(state),
  })

  const name = useWatch({ control, name: "name" })
  const model = useWatch({ control, name: "model" })
  const busy = isSubmitting || saving

  const submit = async (values: WatchFormInput) => {
    try {
      await onSubmit(values)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed.")
    }
  }

  const a11y = (field: keyof WatchFormInput) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? id(`${field}-error`) : undefined,
  })

  const message = (field: keyof WatchFormInput) =>
    errors[field] && (
      <span id={id(`${field}-error`)} role="alert" className={fieldError}>
        {errors[field]?.message}
      </span>
    )

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      aria-busy={busy}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex items-start justify-between gap-4 border-b-4 border-foreground px-5 pt-7 pb-5 sm:px-7">
        <div className="flex min-w-0 flex-col gap-1">
          <span className={eyebrowSm}>
            {editing ? `Editing · ${model || "reference"}` : "New reference"}
          </span>
          <SheetTitle className="truncate font-heading text-[28px] leading-[1.05] font-bold tracking-[-0.02em] sm:text-4xl">
            {name || (editing ? "Untitled" : "New watch")}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {editing
              ? "Update this watch's details."
              : "Add a new watch to the inventory."}
          </SheetDescription>
        </div>
        <SheetClose asChild>
          <button
            type="button"
            aria-label="Close"
            disabled={busy}
            className={closeBtn}
          >
            ✕
          </button>
        </SheetClose>
      </div>

      <fieldset
        disabled={busy}
        className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto px-5 py-6 sm:px-7"
      >
        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>Name</span>
          <Input
            placeholder="e.g. Chronograph I"
            className={cn(fieldControl, "font-heading text-lg font-semibold")}
            {...a11y("name")}
            {...register("name")}
          />
          {message("name")}
        </label>

        <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 sm:gap-3.5">
          <label className="flex flex-col gap-2">
            <span className={fieldLabel}>Model / Ref.</span>
            <Input
              placeholder="Ref. 101"
              className={cn(fieldControl, "font-mono")}
              {...a11y("model")}
              {...register("model")}
            />
            {message("model")}
          </label>

          <div className="flex flex-col gap-2">
            <label htmlFor={id("brandId")} className={fieldLabel}>
              Brand
            </label>
            <select
              id={id("brandId")}
              className={cn(
                fieldControl,
                "w-full cursor-pointer px-3 font-medium outline-none"
              )}
              {...a11y("brandId")}
              {...register("brandId")}
            >
              <option value="">Select brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                onCreateBrand((brand) =>
                  setValue("brandId", brand.id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                )
              }
              className="self-start font-sans text-[11px] font-bold tracking-[1.5px] text-gold uppercase transition-colors hover:text-foreground"
            >
              + Create new brand
            </button>
            {message("brandId")}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 sm:gap-3.5">
          <div className="flex flex-col gap-2">
            <label htmlFor={id("price")} className={fieldLabel}>
              Price (USD)
            </label>
            <div
              className={cn(
                "flex h-12 border-2 border-foreground bg-[#141515] focus-within:border-gold",
                errors.price && "border-gold"
              )}
            >
              <span
                aria-hidden="true"
                className="flex w-10 items-center justify-center border-r-2 border-surface-variant font-heading text-base font-bold text-gold"
              >
                $
              </span>
              <Controller
                control={control}
                name="price"
                render={({ field }) => (
                  <input
                    id={id("price")}
                    inputMode="numeric"
                    placeholder="12,400"
                    value={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    onChange={(event) =>
                      field.onChange(formatPriceInput(event.target.value))
                    }
                    className="min-w-0 flex-1 bg-transparent px-3 font-heading text-base font-bold outline-none"
                    {...a11y("price")}
                  />
                )}
              />
            </div>
            {message("price")}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={id("stock")} className={fieldLabel}>
              Stock
            </label>
            <Controller
              control={control}
              name="stock"
              render={({ field }) => {
                const set = (value: number) =>
                  field.onChange(Math.min(MAX_STOCK, Math.max(0, value)))
                const step =
                  "w-12 shrink-0 bg-[#141515] font-heading text-lg font-bold transition-colors hover:bg-foreground hover:text-black disabled:opacity-35"
                return (
                  <div className="flex h-12 border-2 border-foreground focus-within:border-gold">
                    <button
                      type="button"
                      aria-label="Decrease stock"
                      disabled={field.value <= 0}
                      onClick={() => set(field.value - 1)}
                      className={cn(step, "border-r-2 border-foreground")}
                    >
                      −
                    </button>
                    <input
                      id={id("stock")}
                      inputMode="numeric"
                      value={String(field.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/[^\d]/g, "")
                        set(digits ? Number.parseInt(digits, 10) : 0)
                      }}
                      className="min-w-0 flex-1 bg-transparent text-center font-heading text-base font-bold tabular-nums outline-none"
                      {...a11y("stock")}
                    />
                    <button
                      type="button"
                      aria-label="Increase stock"
                      disabled={field.value >= MAX_STOCK}
                      onClick={() => set(field.value + 1)}
                      className={cn(step, "border-l-2 border-foreground")}
                    >
                      +
                    </button>
                  </div>
                )
              }}
            />
            {message("stock")}
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className={fieldLabel}>Description</span>
          <textarea
            rows={5}
            placeholder="Movement, case, finishing…"
            className={cn(
              fieldControl,
              "h-auto resize-y py-3 leading-6 outline-none"
            )}
            {...a11y("description")}
            {...register("description")}
          />
          {message("description")}
        </label>

        {editing && (
          <button
            type="button"
            onClick={() => onDelete(state.watch)}
            className={textLink}
          >
            Delete reference
          </button>
        )}
      </fieldset>

      <div className="flex gap-3 border-t-4 border-foreground px-5 py-[18px] sm:px-7">
        <SheetClose asChild>
          <Button
            type="button"
            disabled={busy}
            className={cn(btn, btnOutline, "flex-1 px-4")}
          >
            Cancel
          </Button>
        </SheetClose>
        <Button
          type="submit"
          disabled={busy}
          className={cn(btn, btnGold, "flex-1 px-4")}
        >
          {busy && <Spinner aria-hidden="true" />}
          {busy ? "Saving…" : editing ? "Save changes" : "Create watch"}
        </Button>
      </div>
    </form>
  )
}
