"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ForgotPasswordInput, forgotPasswordSchema } from "@/app/(auth)/_utils/schema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { forgotPassword } from "@/app/(auth)/_actions/password"


export function ForgotPasswordForm() {
    const router = useRouter();
    
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
      const result = await forgotPassword(data);

      if(!result.success){
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/forgot-password/verify-email");
  }

  return (
    <div className="w-full max-w-md mx-auto border-4 border-black bg-card p-6 sm:p-10 shadow-2xl dark:border-white dark:bg-[#1a1c1c]">
      {/* Brand Header */}
      <div className="border-b-2 border-black pb-5 mb-6 dark:border-white">
        <span className="text-2xl font-bold tracking-tight font-heading block">
          XII
        </span>

        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-heading mt-2">
          FORGOT PASSWORD
        </h2>

        <p className="text-xs text-muted-foreground mt-1">
          Enter your email address and we&apos;ll send you a verification code to reset your password.
        </p>
      </div>

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-[1.5px] font-heading block"
          >
            EMAIL
          </label>

          <Input
            id="email"
            type="email"
            placeholder="e.g. name@example.com"
            disabled={isSubmitting}
            {...register("email")}
            className={
              errors.email
                ? "border-red-600 dark:border-red-500 bg-red-50/40 dark:bg-red-950/25 ring-1 ring-red-600/30 dark:ring-red-500/30 focus:border-red-600 dark:focus:border-red-500"
                : ""
            }
          />

          {errors.email && (
            <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold tracking-wide flex items-center gap-1.5 mt-1.5">
              <AlertCircle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Action */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          disabled={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner className="size-4 animate-spin text-white" />
              SENDING...
            </span>
          ) : (
            "SEND RESET CODE"
          )}
        </Button>
      </form>

      {/* Back to Sign In */}
      <div className="border-t-2 border-black/20 dark:border-white/20 pt-6 mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-foreground underline-offset-4 hover:underline hover:text-[#B08D57] ml-1 uppercase"
          >
            SIGN IN
          </Link>
        </p>
      </div>
    </div>
  )
}

