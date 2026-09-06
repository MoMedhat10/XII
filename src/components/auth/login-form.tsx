"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/app/(auth)/_utils/schema"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { loginUser } from "@/app/(auth)/_actions"
import { toast } from "sonner"

export function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors , isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  })

  const onSubmit = async (data: LoginInput) => {
      const result = await loginUser(data);

      if(!result.success){
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/");
  }

  return (
    <div className="w-full max-w-md mx-auto border-4 border-black bg-card p-6 sm:p-10 shadow-2xl dark:border-white dark:bg-[#1a1c1c]">
      {/* Brand Header */}
      <div className="border-b-2 border-black pb-5 mb-6 dark:border-white">
        <span className="text-2xl font-bold tracking-tight font-heading block">
          XII
        </span>
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight font-heading mt-2">
          SIGN IN
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Welcome back. Access your luxury timepiece portfolio.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Identifier Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="identifier"
            className="text-xs font-bold uppercase tracking-[1.5px] font-heading block"
          >
            EMAIL OR USERNAME
          </label>
          <Input
            id="identifier"
            type="text"
            placeholder="e.g. name@example.com"
            disabled={isSubmitting}
            {...register("identifier")}
            className={
              errors.identifier
                ? "border-red-600 dark:border-red-500 bg-red-50/40 dark:bg-red-950/25 ring-1 ring-red-600/30 dark:ring-red-500/30 focus:border-red-600 dark:focus:border-red-500"
                : ""
            }
          />
          {errors.identifier && (
            <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold tracking-wide flex items-center gap-1.5 mt-1.5">
              <AlertCircle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
              {errors.identifier.message}
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
            <Link
              href="#"
              className="text-xs text-[#B08D57] hover:underline"
              onClick={(e) => {
                e.preventDefault()
                alert("Password reset flow will be enabled with backend integration.")
              }}
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••••••"
            disabled={isSubmitting}
            {...register("password")}
            className={
              errors.password
                ? "border-red-600 dark:border-red-500 bg-red-50/40 dark:bg-red-950/25 ring-1 ring-red-600/30 dark:ring-red-500/30 focus:border-red-600 dark:focus:border-red-500"
                : ""
            }
          />
          {errors.password && (
            <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-semibold tracking-wide flex items-center gap-1.5 mt-1.5">
              <AlertCircle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="remember"
            type="checkbox"
            {...register("remember")}
            className="size-4 rounded-none border-2 border-black accent-black dark:border-white dark:accent-white cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="text-xs text-muted-foreground cursor-pointer select-none"
          >
            Remember me
          </label>
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
              SIGNING IN...
            </span>
          ) : (
            "SIGN IN"
          )}
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="border-t-2 border-black/20 dark:border-white/20 pt-6 mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-foreground underline-offset-4 hover:underline hover:text-[#B08D57] ml-1 uppercase"
          >
            CREATE AN ACCOUNT
          </Link>
        </p>
      </div>
    </div>
  )
}
