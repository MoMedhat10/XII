import { Metadata } from "next"
import ForgotPasswordVerification from "@/components/auth/forgot-password-verification"

export const metadata: Metadata = {
  title: "Verify Reset Code | XII Luxury Timepieces",
  description:
    "Enter the verification code sent to your email to verify your identity and reset your XII account password.",
  openGraph: {
    title: "Verify Reset Code | XII Luxury Timepieces",
    description:
      "Enter the verification code sent to your email to verify your identity and reset your XII account password.",
    type: "website",
  },
}

export default function VerifyEmailPage() {
  return <ForgotPasswordVerification />
}