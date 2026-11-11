"use client"

import { useEffect, useId } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"

import type { ServerError } from "@/app/(dashboard)/_utils/action-client"
import {
  shipFormSchema,
  type ShipFormValues,
} from "@/app/(dashboard)/dashboard/orders/_utils/order-schema"
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
} from "../styles"

/** Carriers admins pick most; any other name can be typed. */
const CARRIERS = ["DHL Express", "FedEx", "UPS", "Brink's", "Malca-Amit"]

export function OrderShipDialog({
  open,
  orderRef,
  saving,
  serverError,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  orderRef: string | undefined
  saving: boolean
  serverError?: ServerError
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ShipFormValues) => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!saving) onOpenChange(next)
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          portalTheme,
          "max-h-[calc(100dvh-32px)] w-[min(480px,calc(100vw-32px))] max-w-none gap-5 overflow-y-auto bg-background p-6 text-sm shadow-[12px_12px_0_var(--gold)] sm:max-w-none sm:p-7"
        )}
      >
        {/* remounts on every open, so the form starts empty */}
        {open && (
          <ShipForm
            orderRef={orderRef}
            saving={saving}
            serverError={serverError}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ShipForm({
  orderRef,
  saving,
  serverError,
  onSubmit,
}: {
  orderRef: string | undefined
  saving: boolean
  serverError?: ServerError
  onSubmit: (values: ShipFormValues) => void
}) {
  const uid = useId()
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<ShipFormValues>({
    resolver: zodResolver(shipFormSchema),
    defaultValues: {
      carrier: CARRIERS[0],
      useOwnNumber: false,
      trackingNumber: "",
    },
  })
  const useOwnNumber = useWatch({ control, name: "useOwnNumber" })

  const chooseOwnNumber = (own: boolean) => {
    setValue("useOwnNumber", own)
    setValue("trackingNumber", "")
    clearErrors("trackingNumber")
  }

  // server validation errors go under their field (other errors are toasts)
  useEffect(() => {
    for (const [field, message] of Object.entries(
      serverError?.fieldErrors ?? {}
    )) {
      if (message && (field === "carrier" || field === "trackingNumber")) {
        setError(field, { type: "server", message })
      }
    }
  }, [serverError, setError])

  const textLink =
    "self-start border-b-2 border-surface-variant pb-0.5 font-heading text-xs font-bold tracking-[1.5px] text-muted-foreground uppercase transition-colors hover:border-gold hover:text-gold"

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={saving}
      className="flex flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className={eyebrowSm}>Ship {orderRef}</span>
          <DialogTitle className="font-heading text-[32px] leading-[1.1] font-bold tracking-[-0.02em]">
            Mark shipped
          </DialogTitle>
          <DialogDescription className="text-[15px] leading-6 text-muted-foreground">
            {useOwnNumber
              ? "Your tracking number is emailed to the customer."
              : "A shipment number is generated and emailed to the customer."}{" "}
            A shipped order can&apos;t be cancelled.
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close"
            disabled={saving}
            className={closeBtn}
          >
            ✕
          </button>
        </DialogClose>
      </div>

      <fieldset disabled={saving} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${uid}-carrier`} className={fieldLabel}>
            Carrier
          </label>
          <Input
            id={`${uid}-carrier`}
            list={`${uid}-carriers`}
            autoComplete="off"
            aria-invalid={!!errors.carrier}
            aria-describedby={
              errors.carrier ? `${uid}-carrier-error` : undefined
            }
            className={fieldControl}
            {...register("carrier")}
          />
          <datalist id={`${uid}-carriers`}>
            {CARRIERS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.carrier && (
            <p id={`${uid}-carrier-error`} className={fieldError}>
              {errors.carrier.message}
            </p>
          )}
        </div>

        {useOwnNumber ? (
          <div className="flex flex-col gap-2">
            <label htmlFor={`${uid}-tracking`} className={fieldLabel}>
              Tracking number
            </label>
            <Input
              id={`${uid}-tracking`}
              autoComplete="off"
              autoFocus
              spellCheck={false}
              maxLength={40}
              aria-invalid={!!errors.trackingNumber}
              aria-describedby={
                errors.trackingNumber ? `${uid}-tracking-error` : undefined
              }
              className={cn(fieldControl, "font-mono")}
              {...register("trackingNumber")}
            />
            {errors.trackingNumber && (
              <p id={`${uid}-tracking-error`} className={fieldError}>
                {errors.trackingNumber.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => chooseOwnNumber(false)}
              className={textLink}
            >
              Generate one instead
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => chooseOwnNumber(true)}
            className={textLink}
          >
            Use my own tracking number
          </button>
        )}
      </fieldset>

      <div className="flex gap-3">
        <DialogClose asChild>
          <Button
            type="button"
            disabled={saving}
            className={cn(btn, btnOutline, "flex-1 px-4")}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={saving}
          className={cn(btn, btnGold, "flex-1 px-4")}
        >
          {saving && <Spinner aria-hidden="true" />}
          {saving ? "Shipping…" : "Ship order"}
        </Button>
      </div>
    </form>
  )
}
