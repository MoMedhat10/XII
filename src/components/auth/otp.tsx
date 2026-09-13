"use client";

import { type VerifyOTPInput } from "@/app/(auth)/_utils/schema"
import { Controller, UseFormReturn } from "react-hook-form"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react"
import { Button } from "../ui/button"
import { Spinner } from "../ui/spinner"
import { useEffect, useRef } from "react"


interface IOtpForm {
  form: UseFormReturn<VerifyOTPInput>;
  isVerified: boolean;
  onSubmit: (data: VerifyOTPInput) => Promise<void>;
}


export default function OtpForm({ form, isVerified, onSubmit }: IOtpForm) {

    const { control, handleSubmit, formState: { errors, isSubmitting } } = form;
    const otpRef = useRef<HTMLInputElement>(null);

    useEffect(()=>{
      otpRef.current?.focus();
    },[])



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label
                        htmlFor="otp-input"
                        className="text-xs font-bold uppercase tracking-[1.5px] font-heading block"
                    >
                        AUTHENTICATION KEY
                    </label>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        6-DIGIT CODE
                    </span>
                </div>

                {/* OTP Controlled Field with Split 3x3 Format */}
                <div className="flex flex-col items-center justify-center py-2">
                    <Controller
                        control={control}
                        name="otp"
                        render={({ field }) => (
                            <InputOTP
                                id="otp-input"
                                maxLength={6}
                                pattern={REGEXP_ONLY_DIGITS}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isSubmitting || isVerified}
                                aria-invalid={!!errors.otp}
                                containerClassName="gap-2 sm:gap-3"
                                ref={otpRef}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot  index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        )}
                    />
                </div>

                {/* Error Message */}
                {errors.otp && (
                    <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold tracking-wide flex items-center justify-center gap-1.5 mt-1">
                        <AlertCircle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
                        {errors.otp.message}
                    </p>
                )}

            </div>

            {/* Submit Action */}
            <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={isSubmitting || isVerified}
                className="w-full"
            >
                {isVerified ? (
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-white" />
                        VERIFIED
                    </span>
                ) : isSubmitting ? (
                    <span className="flex items-center gap-2">
                        <Spinner className="size-4 animate-spin text-white" />
                        VERIFYING...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <ShieldCheck className="size-4" />
                        VERIFY CODE
                    </span>
                )}
            </Button>
        </form>
    )


}