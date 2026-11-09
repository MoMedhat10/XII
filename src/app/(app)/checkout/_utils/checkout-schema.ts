import { z } from "zod"

import { cardLength, digitsOnly, expiryValid, luhnValid } from "./card"
import { COUNTRY_CODES } from "./countries"
import {
  dialCountryName,
  isDialCountry,
  parsePhone,
  type CountryCode,
} from "./phone"

const text = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required`)
    .max(max, `${label} is too long`)

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} is too long`)

export const shippingSchema = z
  .object({
    name: text("Full name", 2, 80),
    phoneCountry: z.string().refine(isDialCountry, "Choose a country code"),
    phone: z.string().trim().min(1, "Enter a phone number"),
    line1: text("Address", 3, 120),
    line2: optionalText("Address line 2", 120),
    city: text("City", 2, 80),
    region: optionalText("State / region", 80),
    postalCode: text("Postal code", 2, 12),
    country: z.enum(COUNTRY_CODES, "Choose a country"),
  })
  .superRefine((s, ctx) => {
    if (!s.phone || !isDialCountry(s.phoneCountry)) return
    if (!parsePhone(s.phone, s.phoneCountry)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: `Enter a valid phone number for ${dialCountryName(s.phoneCountry)}`,
      })
    }
  })
  // Stored as E.164 ("+41225550100"); the code is part of it, so
  // phoneCountry isn't kept.
  .transform(({ phoneCountry, ...s }) => ({
    ...s,
    phone: parsePhone(s.phone, phoneCountry as CountryCode)!.number,
  }))
export type ShippingInput = z.infer<typeof shippingSchema>

export const paymentSchema = z.object({
  cardName: text("Name on card", 2, 80),
  cardNumber: z
    .string()
    .transform(digitsOnly)
    .refine((n) => n.length === cardLength(n), "Enter the full card number")
    .refine(luhnValid, "This card number isn't valid"),
  expiry: z.string().trim().refine(expiryValid, "Enter a valid MM/YY date"),
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3}$/, "Enter the 3-digit security code"),
})
export type PaymentInput = z.input<typeof paymentSchema>

export const checkoutFormSchema = z.object({
  shipping: shippingSchema,
  payment: paymentSchema,
})
export type CheckoutFormInput = z.input<typeof checkoutFormSchema>
export type CheckoutFormOutput = z.output<typeof checkoutFormSchema>

export const placeOrderSchema = checkoutFormSchema.extend({
  checkoutKey: z.uuid(),
  expectedTotalCents: z.number().int().nonnegative(),
})
export type PlaceOrderInput = z.input<typeof placeOrderSchema>
