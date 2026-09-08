"use client"

import Link from "next/link"
import { useForm , useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/app/(auth)/_utils/schema"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"
import { registerUser } from "@/app/(auth)/_actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function RegisterForm() {
  const router = useRouter();

 const {
  register,
  handleSubmit,
  control,
  formState: { errors , isSubmitting },
} = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
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

  const onSubmit = async (data: RegisterInput) => {
    const result = await registerUser(data);

    if(!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push(`/verify-email?id=${result?.data}`);
  }

  return (
    <div className="w-full max-w-md mx-auto border-4 border-black bg-card p-6 sm:p-10 shadow-2xl dark:border-white dark:bg-[#1a1c1c]">
      {/* Brand Header */}
      <div className="border-b-2 border-black pb-5 mb-6 dark:border-white">
        <span className="text-2xl font-bold tracking-tight font-heading block">
          XII
        </span>
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-heading mt-2">
          CREATE AN ACCOUNT
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Join XII to discover exceptional global luxury timepieces.
        </p>
      </div>

      

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Username Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="text-xs font-bold uppercase tracking-[1.5px] font-heading block"
          >
            USERNAME
          </label>
          <Input
            id="username"
            type="text"
            placeholder="e.g. constantin_xii"
            disabled={isSubmitting}
            {...register("username")}
            className={
              errors.username
                ? "border-red-600 dark:border-red-500 bg-red-50/40 dark:bg-red-950/25 ring-1 ring-red-600/30 dark:ring-red-500/30 focus:border-red-600 dark:focus:border-red-500"
                : ""
            }
          />
          {errors.username && (
            <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold tracking-wide flex items-center gap-1.5 mt-1.5">
              <AlertCircle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
              {errors.username.message}
            </p>
          )}
        </div>

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
            placeholder="name@example.com"
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
                  className={`h-1.5 transition-all ${
                    passwordStrength >= step
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

        {/* Terms Agreement Checkbox */}
        <div className="space-y-1 pt-1">
          <div className="flex items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              {...register("terms")}
              className={`size-4 mt-0.5 rounded-none border-2 accent-black dark:accent-white cursor-pointer ${
                errors.terms ? "border-red-600 dark:border-red-500" : "border-black dark:border-white"
              }`}
            />
            <label
              htmlFor="terms"
              className="text-xs text-muted-foreground cursor-pointer mt-0.5 select-none leading-tight"
            >
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          {errors.terms && (
            <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold tracking-wide flex items-center gap-1.5 mt-1">
              <AlertCircle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
              {errors.terms.message}
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
              CREATING ACCOUNT...
            </span>
          ) : (
            "CREATE ACCOUNT"
          )}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="border-t-2 border-black/20 dark:border-white/20 pt-6 mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
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
