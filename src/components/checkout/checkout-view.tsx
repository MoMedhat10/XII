"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { placeOrder } from "@/app/(app)/checkout/_actions/checkout"
import type { CheckoutPage } from "@/app/(app)/checkout/_data/checkout"
import {
  checkoutFormSchema,
  type CheckoutFormInput,
  type CheckoutFormOutput,
} from "@/app/(app)/checkout/_utils/checkout-schema"
import { countryName } from "@/app/(app)/checkout/_utils/countries"
import { formatPhoneInternational } from "@/app/(app)/checkout/_utils/phone"
import { cn } from "@/lib/utils"

import { eyebrow, gutter, monoCaption, textLink } from "../home/styles"
import { CheckoutSteps } from "./checkout-steps"
import { CheckoutSummary } from "./checkout-summary"
import { PaymentFields } from "./payment-fields"
import { ShippingFields } from "./shipping-fields"

const EMPTY: CheckoutFormInput = {
  shipping: {
    name: "",
    phoneCountry: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "" as CheckoutFormInput["shipping"]["country"],
  },
  payment: { cardName: "", cardNumber: "", expiry: "", cvc: "" },
}

const nextButton =
  "inline-flex h-14 cursor-pointer items-center justify-center border-4 border-foreground bg-foreground px-8 font-sans text-base font-bold tracking-[1.5px] text-black uppercase transition-colors hover:border-gold hover:bg-gold hover:text-white"

export function CheckoutView({ lines, subtotalCents, email }: CheckoutPage) {
  const router = useRouter()
  const [step, setStep] = useState<0 | 1>(0)
  const [pending, startTransition] = useTransition()
  // One key per checkout visit: a double click or a retry after a lost
  // response maps to the same order instead of a second one.
  const [checkoutKey] = useState(() => crypto.randomUUID())

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    getFieldState,
    formState: { errors },
  } = useForm<CheckoutFormInput, unknown, CheckoutFormOutput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: EMPTY,
    mode: "onTouched",
  })
  const shipping = useWatch({ control, name: "shipping" })
  const cardNumber = useWatch({ control, name: "payment.cardNumber" })

  // The country code follows the shipping country until the customer picks
  // one themselves (a phone from another country is common).
  useEffect(() => {
    if (!shipping.country) return
    if (getFieldState("shipping.phoneCountry").isDirty) return
    setValue("shipping.phoneCountry", shipping.country, {
      shouldValidate: false,
    })
  }, [shipping.country, getFieldState, setValue])

  const toPayment = async () => {
    if (await trigger("shipping", { shouldFocus: true })) setStep(1)
  }

  // handleSubmit only validates here: the action re-checks with the same
  // schema, so it gets the values as typed (national number + code), not
  // the converted output.
  const onSubmit = () =>
    startTransition(async () => {
      const res = await placeOrder({
        ...getValues(),
        checkoutKey,
        expectedTotalCents: subtotalCents,
      })
      if (!res.success) {
        toast.error(res.message)
        // the bag or prices changed: show the new summary
        if (res.stale) router.refresh()
        return
      }
      toast.success(res.message)
      router.replace(`/orders/${res.data.orderId}?placed=1`)
    })

  const address =
    step === 1
      ? [
          shipping.name,
          shipping.line1,
          shipping.line2,
          [shipping.city, shipping.region, shipping.postalCode]
            .filter(Boolean)
            .join(", "),
          countryName(shipping.country),
          formatPhoneInternational(shipping.phone, shipping.phoneCountry),
        ].filter((l): l is string => Boolean(l))
      : null

  return (
    <section className={cn(gutter, "pt-20 pb-24 sm:pt-28 sm:pb-32")}>
      <div className="border-b-4 pb-6 sm:pb-8">
        <span className={cn(eyebrow, "mb-2")}>Secure Checkout</span>
        <h1 className="font-heading text-[clamp(36px,6vw,88px)] leading-none font-bold tracking-[-0.02em]">
          Checkout
        </h1>
      </div>

      <div className="flex flex-col gap-10 pt-8 lg:flex-row lg:items-start lg:gap-12">
        <form
          id="checkout-form"
          noValidate
          onSubmit={
            step === 0
              ? (e) => {
                  // Enter on the shipping step moves on instead of paying
                  e.preventDefault()
                  void toPayment()
                }
              : handleSubmit(onSubmit)
          }
          className="flex min-w-0 flex-col gap-8 lg:flex-1"
        >
          <CheckoutSteps step={step} />

          <p className={cn(monoCaption, "uppercase")}>
            Confirmation goes to {email}
          </p>

          {step === 0 ? (
            <>
              <ShippingFields
                register={register}
                control={control}
                setValue={setValue}
                errors={errors.shipping}
                disabled={pending}
              />
              <button type="button" onClick={toPayment} className={nextButton}>
                Continue to payment →
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 border-b-2 border-surface-variant pb-4">
                <span className="font-sans text-sm text-muted-foreground">
                  Shipping to {shipping.name}, {shipping.city} ·{" "}
                  {shipping.phoneCountry &&
                    formatPhoneInternational(
                      shipping.phone,
                      shipping.phoneCountry
                    )}
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStep(0)}
                  className={cn(textLink, "cursor-pointer")}
                >
                  Edit
                </button>
              </div>
              <PaymentFields
                register={register}
                control={control}
                errors={errors.payment}
                cardNumber={cardNumber}
                disabled={pending}
              />
            </>
          )}
        </form>

        <CheckoutSummary
          lines={lines}
          subtotalCents={subtotalCents}
          address={address}
          canPlace={step === 1}
          pending={pending}
        />
      </div>
    </section>
  )
}
