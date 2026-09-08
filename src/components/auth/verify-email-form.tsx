"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
  verifyEmailSchema,
  type VerifyEmailInput,
} from "@/app/(auth)/_utils/schema"
import { useCooldown } from "@/hooks/use-cooldown"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { resendEmailVerificationCode, verifyEmail } from "@/app/(auth)/_actions"

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  console.log(id);

  const [isVerified, setIsVerified] = useState(false)

  const {
    secondsLeft,
    isActive: isCooldownActive,
    start: startCooldown,
    reset: resetCooldown,
  } = useCooldown("xii_verify_email_cooldown", 90)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetForm,
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  })


  const onSubmit = async ({ otp }: VerifyEmailInput) => {
    if (!id) return;
    const result = await verifyEmail(id, otp);


    if (!result.success) {
      toast.error(result.message)
      return;
    }

    toast.success(result.message);
    setIsVerified(true);
    resetCooldown();
    resetForm({ otp: "" });
    router.push('/login');
  }

  const handleResend = async () => {
    if (!id) return;
    startCooldown(90)
    resetForm({ otp: "" })
    const result = await resendEmailVerificationCode(id);

    if (!result.success) {
      toast.error(result.message)
      return;
    }

    toast.success(result.message);
  }

  return (
    <div className="w-full max-w-md mx-auto border-4 border-black bg-card p-6 sm:p-10 shadow-2xl dark:border-white dark:bg-[#1a1c1c]">
      {/* Brand Header */}
      <div className="border-b-2 border-black pb-5 mb-6 dark:border-white">
        <span className="text-2xl font-bold tracking-tight font-heading block">
          XII
        </span>
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-heading mt-2">
          VERIFY EMAIL
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enter the 6-digit authentication key sent to your inbox to activate your timepiece portfolio.
        </p>
      </div>



      {/* Verification Form */}
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
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
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
              VERIFY KEY
            </span>
          )}
        </Button>
      </form>

      {/* Resend Code & Back to Sign In */}
      <div className="border-t-2 border-black/20 dark:border-white/20 pt-6 mt-6 space-y-3 text-center">
        {/* Resend Cooldown Display */}
        <div className="text-xs text-muted-foreground">
          Didn&apos;t receive the key?{" "}
          {isCooldownActive ? (
            <span className="font-mono font-bold text-foreground/80 tracking-wide uppercase">
              Resend in {secondsLeft}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isSubmitting || isVerified}
              className="font-bold text-foreground underline-offset-4 hover:underline hover:text-[#B08D57] transition-colors ml-1 uppercase disabled:opacity-50 disabled:pointer-events-none"
            >
              RESEND KEY
            </button>
          )}
        </div>

        {/* Return to Sign In */}
        <div>
          <Link
            href="/login"
            className="font-bold text-foreground underline-offset-4 hover:underline hover:text-[#B08D57] transition-colors text-xs uppercase"
          >
            BACK TO SIGN IN
          </Link>
        </div>
      </div>
    </div>
  )
}
