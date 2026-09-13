"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  verifyOTPSchema,
  type VerifyOTPInput,
} from "@/app/(auth)/_utils/schema"
import { useCooldown } from "@/hooks/use-cooldown"
import { toast } from "sonner"
import { resendEmailVerificationCode, verifyEmail } from "@/app/(auth)/_actions"
import OtpForm from "./otp"

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isVerified, setIsVerified] = useState(false);


  const { secondsLeft, isActive: isCooldownActive, start: startCooldown, reset: resetCooldown } =
    useCooldown("xii_verify_email_cooldown", 90);


  const form = useForm<VerifyOTPInput>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: { otp: "" },
  });


  const onSubmit = async ({ otp }: VerifyOTPInput) => {
    if (!id) return;
    const result = await verifyEmail(id, otp);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setIsVerified(true);
    resetCooldown();
    form.reset({ otp: "" });
    router.push('/login');
  };


  const handleResend = async () => {
    if (!id) return;
    startCooldown(90);
    form.reset({ otp: "" }); 
    const result = await resendEmailVerificationCode(id);
    
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
  };


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
      <OtpForm
        form={form}
        isVerified={isVerified}
        onSubmit={onSubmit}
      />

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
              disabled={form.formState.isSubmitting || isVerified}
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
