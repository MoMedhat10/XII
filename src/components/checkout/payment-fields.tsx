"use client"

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form"

import {
  cardBrand,
  formatCardNumber,
  formatExpiry,
} from "@/app/(app)/checkout/_utils/card"
import type {
  CheckoutFormInput,
  CheckoutFormOutput,
} from "@/app/(app)/checkout/_utils/checkout-schema"
import { cn } from "@/lib/utils"

import { monoCaption } from "../home/styles"
import { CheckoutField } from "./checkout-field"

export function PaymentFields({
  register,
  control,
  errors,
  cardNumber,
  disabled,
}: {
  register: UseFormRegister<CheckoutFormInput>
  control: Control<CheckoutFormInput, unknown, CheckoutFormOutput>
  errors: FieldErrors<CheckoutFormInput>["payment"]
  cardNumber: string
  disabled: boolean
}) {
  const brand = cardBrand(cardNumber)

  return (
    <fieldset disabled={disabled} className="grid gap-5 sm:grid-cols-2">
      <legend className="sr-only">Payment</legend>
      <p
        className={cn(
          monoCaption,
          "border-2 border-red-500 px-4 py-3 leading-5 text-red-500 uppercase sm:col-span-2"
        )}
      >
        Demo checkout — no card is charged. Use 4242 4242 4242 4242 to pay, or
        4000 0000 0000 0002 to test a decline.
      </p>
      <CheckoutField
        id="card-name"
        label="Name on card"
        autoComplete="cc-name"
        error={errors?.cardName?.message}
        className="sm:col-span-2"
        {...register("payment.cardName")}
      />
      <Controller
        control={control}
        name="payment.cardNumber"
        render={({ field }) => (
          <CheckoutField
            id="card-number"
            label={brand ? `Card number · ${brand}` : "Card number"}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            error={errors?.cardNumber?.message}
            className="sm:col-span-2"
            {...field}
            onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
          />
        )}
      />
      <Controller
        control={control}
        name="payment.expiry"
        render={({ field }) => (
          <CheckoutField
            id="card-expiry"
            label="Expiry (MM/YY)"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            error={errors?.expiry?.message}
            {...field}
            onChange={(e) => field.onChange(formatExpiry(e.target.value))}
          />
        )}
      />
      <CheckoutField
        id="card-cvc"
        label="Security code"
        inputMode="numeric"
        autoComplete="cc-csc"
        maxLength={3}
        placeholder="3 digits"
        error={errors?.cvc?.message}
        {...register("payment.cvc")}
      />
    </fieldset>
  )
}
