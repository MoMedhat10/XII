import { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password | XII Luxury Timepieces",
  description:
    "Request a password reset verification code to recover access to your XII Luxury Timepieces account.",
  openGraph: {
    title: "Forgot Password | XII Luxury Timepieces",
    description:
      "Request a password reset verification code to recover access to your XII Luxury Timepieces account.",
    type: "website",
  },
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}