"use client"

import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"

import { COUNTRIES } from "@/app/(app)/checkout/_utils/countries"
import type {
  CheckoutFormInput,
  CheckoutFormOutput,
} from "@/app/(app)/checkout/_utils/checkout-schema"
import { fieldControl, fieldLabel } from "@/components/dashboard/styles"
import { cn } from "@/lib/utils"

import { CheckoutField, errorBorder, errorText } from "./checkout-field"
import { PhoneField } from "./phone-field"

export function ShippingFields({
  register,
  control,
  setValue,
  errors,
  disabled,
}: {
  register: UseFormRegister<CheckoutFormInput>
  control: Control<CheckoutFormInput, unknown, CheckoutFormOutput>
  setValue: UseFormSetValue<CheckoutFormInput>
  errors: FieldErrors<CheckoutFormInput>["shipping"]
  disabled: boolean
}) {
  return (
    <fieldset disabled={disabled} className="grid gap-5 sm:grid-cols-2">
      <legend className="sr-only">Shipping address</legend>
      <CheckoutField
        id="ship-name"
        label="Full name"
        autoComplete="name"
        error={errors?.name?.message}
        className="sm:col-span-2"
        {...register("shipping.name")}
      />
      <PhoneField
        control={control}
        setValue={setValue}
        error={errors?.phone?.message ?? errors?.phoneCountry?.message}
        className="sm:col-span-2"
      />
      <CheckoutField
        id="ship-line1"
        label="Address"
        autoComplete="address-line1"
        error={errors?.line1?.message}
        className="sm:col-span-2"
        {...register("shipping.line1")}
      />
      <CheckoutField
        id="ship-line2"
        label="Apartment, suite (optional)"
        autoComplete="address-line2"
        error={errors?.line2?.message}
        className="sm:col-span-2"
        {...register("shipping.line2")}
      />
      <CheckoutField
        id="ship-city"
        label="City"
        autoComplete="address-level2"
        error={errors?.city?.message}
        {...register("shipping.city")}
      />
      <CheckoutField
        id="ship-region"
        label="State / region (optional)"
        autoComplete="address-level1"
        error={errors?.region?.message}
        {...register("shipping.region")}
      />
      <CheckoutField
        id="ship-postal"
        label="Postal code"
        autoComplete="postal-code"
        error={errors?.postalCode?.message}
        {...register("shipping.postalCode")}
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="ship-country" className={fieldLabel}>
          Country
        </label>
        <select
          id="ship-country"
          autoComplete="country"
          aria-invalid={errors?.country ? true : undefined}
          className={cn(
            fieldControl,
            "w-full rounded-none border-2 outline-none",
            errors?.country && errorBorder
          )}
          {...register("shipping.country")}
        >
          <option value="">Select…</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        {errors?.country && (
          <p className={errorText}>{errors.country.message}</p>
        )}
      </div>
    </fieldset>
  )
}
