"use client"

import {
  Controller,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form"

import type {
  CheckoutFormInput,
  CheckoutFormOutput,
} from "@/app/(app)/checkout/_utils/checkout-schema"
import {
  DIAL_CODES,
  formatPhoneTyping,
  isDialCountry,
  splitInternational,
} from "@/app/(app)/checkout/_utils/phone"
import {
  fieldControl,
  fieldLabel,
} from "@/components/dashboard/watches/watch-utils"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { errorBorder, errorText } from "./checkout-field"

/** Country code select + national number, validated per country. */
export function PhoneField({
  control,
  setValue,
  error,
  className,
}: {
  control: Control<CheckoutFormInput, unknown, CheckoutFormOutput>
  setValue: UseFormSetValue<CheckoutFormInput>
  error?: string
  className?: string
}) {
  const country = useWatch({ control, name: "shipping.phoneCountry" })

  return (
    <div
      role="group"
      aria-labelledby="ship-phone-label"
      className={cn("flex flex-col gap-2", className)}
    >
      <label id="ship-phone-label" htmlFor="ship-phone" className={fieldLabel}>
        Phone
      </label>
      <div className="flex gap-2">
        <Controller
          control={control}
          name="shipping.phoneCountry"
          render={({ field }) => {
            const selected = DIAL_CODES.find((c) => c.code === field.value)
            return (
              // The box shows the short "CH +41"; the real select sits on top,
              // invisible, so its open list can show full country names.
              <div
                className={cn(
                  fieldControl,
                  "relative flex w-33 shrink-0 items-center justify-between border-2 focus-within:border-gold",
                  error && errorBorder
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(!selected && "text-muted-foreground")}
                >
                  {selected ? `${selected.code} ${selected.dial}` : "Code"}
                </span>
                <span aria-hidden="true" className="text-xs">
                  ▾
                </span>
                <select
                  {...field}
                  aria-label="Country code"
                  autoComplete="tel-country-code"
                  aria-invalid={error ? true : undefined}
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  <option value="">Choose a country code</option>
                  {DIAL_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.dial})
                    </option>
                  ))}
                </select>
              </div>
            )
          }}
        />
        <Controller
          control={control}
          name="shipping.phone"
          render={({ field }) => (
            <Input
              {...field}
              id="ship-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="Phone number"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "ship-phone-error" : undefined}
              className={cn(
                fieldControl,
                "min-w-0 flex-1",
                error && errorBorder
              )}
              onChange={(e) => {
                const value = e.target.value
                // a pasted "+44 20 7946 0958" picks its own code
                const intl = splitInternational(value)
                if (intl) {
                  setValue("shipping.phoneCountry", intl.country, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                  field.onChange(intl.national)
                  return
                }
                // Don't reformat while deleting, or Backspace on a space
                // or bracket would put it straight back.
                const deleting = value.length < (field.value ?? "").length
                field.onChange(
                  isDialCountry(country) && !deleting
                    ? formatPhoneTyping(value, country)
                    : value
                )
              }}
            />
          )}
        />
      </div>
      {error && (
        <p id="ship-phone-error" className={errorText}>
          {error}
        </p>
      )}
    </div>
  )
}
