"use client"

import { ResetPasswordInput, resetPasswordSchema } from "@/app/(auth)/_utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { PasswordInput } from "../ui/password-input";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { resetPassword } from "@/app/(auth)/_actions/password";

export default function ResetPasswordForm() {

    const router = useRouter();

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const watchPassword = useWatch({
        control,
        name: "password",
        defaultValue: "",
    })

    // Calculate password strength rating (0 - 4)
    let passwordStrength = 0
    if (watchPassword.length >= 8) passwordStrength++
    if (/[A-Z]/.test(watchPassword)) passwordStrength++
    if (/[0-9]/.test(watchPassword)) passwordStrength++
    if (/[^a-zA-Z0-9]/.test(watchPassword)) passwordStrength++

    const strengthLabels = ["WEAK", "FAIR", "GOOD", "STRONG"] as const



    const onSubmit = async (data: ResetPasswordInput) => {
        const result = await resetPassword(data);
        if (result.success) {
            toast.success(result.message);
            router.push("/login");
            return
        }
        
        toast.error(result.message);
    }

    return (
        <div className="w-full max-w-md mx-auto border-4 border-black bg-card p-6 sm:p-10 shadow-2xl dark:border-white dark:bg-[#1a1c1c]">
            {/* Brand Header */}
            <div className="border-b-2 border-black pb-5 mb-6 dark:border-white">
                <span className="text-2xl font-bold tracking-tight font-heading block">
                    XII
                </span>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-heading mt-2">
                    Reset Password
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Enter your new password below to complete the reset process.
                </p>
            </div>


            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* Password Field */}
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label
                            htmlFor="password"
                            className="text-xs font-bold uppercase tracking-[1.5px] font-heading"
                        >
                            PASSWORD
                        </label>
                        {watchPassword.length > 0 && (
                            <span className="text-[10px] font-mono uppercase text-[#B08D57]">
                                STRENGTH: {strengthLabels[Math.min(passwordStrength, 3)]}
                            </span>
                        )}
                    </div>
                    <PasswordInput
                        id="password"
                        placeholder="Min. 8 chars with 1 uppercase & 1 number"
                        disabled={isSubmitting}
                        {...register("password")}
                        className={
                            errors.password
                                ? "border-red-600 dark:border-red-500 bg-red-50/40 dark:bg-red-950/25 ring-1 ring-red-600/30 dark:ring-red-500/30 focus:border-red-600 dark:focus:border-red-500"
                                : ""
                        }
                    />

                    {/* Stepped Password Strength Gauge */}
                    {watchPassword.length > 0 && (
                        <div className="grid grid-cols-4 gap-1 pt-1">
                            {[1, 2, 3, 4].map((step) => (
                                <div
                                    key={step}
                                    className={`h-1.5 transition-all ${passwordStrength >= step
                                        ? step === 4
                                            ? "bg-[#B08D57]"
                                            : "bg-black dark:bg-white"
                                        : "bg-muted"
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {errors.password && (
                        <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold tracking-wide flex items-center gap-1.5 mt-1.5">
                            <AlertCircle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                    <label
                        htmlFor="confirmPassword"
                        className="text-xs font-bold uppercase tracking-[1.5px] font-heading block"
                    >
                        CONFIRM PASSWORD
                    </label>
                    <PasswordInput
                        id="confirmPassword"
                        placeholder="Repeat password"
                        disabled={isSubmitting}
                        {...register("confirmPassword")}
                        className={
                            errors.confirmPassword
                                ? "border-red-600 dark:border-red-500 bg-red-50/40 dark:bg-red-950/25 ring-1 ring-red-600/30 dark:ring-red-500/30 focus:border-red-600 dark:focus:border-red-500"
                                : ""
                        }
                    />
                    {errors.confirmPassword && (
                        <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold tracking-wide flex items-center gap-1.5 mt-1.5">
                            <AlertCircle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>



                {/* Submit Action */}
                <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full mt-3"
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <Spinner className="size-4 animate-spin text-white" />
                            RESETTING PASSWORD...
                        </span>
                    ) : (
                        "RESET PASSWORD"
                    )}
                </Button>
            </form>
        </div>
    )
}
