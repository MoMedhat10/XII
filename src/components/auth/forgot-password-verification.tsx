"use client"

import { VerifyOTPInput, verifyOTPSchema } from "@/app/(auth)/_utils/schema";
import { useCooldown } from "@/hooks/use-cooldown";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import OtpForm from "./otp";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resendForgotPasswordOTP, verifyForgotPasswordOTP } from "@/app/(auth)/_actions/password";



export default function ForgotPasswordVerification() {

    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    const { secondsLeft, isActive: isCooldownActive, start: startCooldown, reset: resetCooldown } =
        useCooldown("xii_verify_email_cooldown", 90);


    const form = useForm<VerifyOTPInput>({
        resolver: zodResolver(verifyOTPSchema),
        defaultValues: { otp: "" },
    });


    const onSubmit = async ({ otp }: VerifyOTPInput) => {
         const result = await verifyForgotPasswordOTP(otp);

         if(!result.success){
            toast.error(result.message)
            return;
         }

         toast.success(result.message);
         setIsVerified(true);
         resetCooldown();
         router.push("/reset-password");
    };


    const handleResend = async () => {
         startCooldown();
         form.reset({ otp: "" });
         const result = await resendForgotPasswordOTP();

         if(!result.success){
            toast.error(result.message)
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
                    Enter the 6-digit authentication key sent to your inbox to verify your email.
                </p>
            </div>

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
                            RESEND CODE
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

