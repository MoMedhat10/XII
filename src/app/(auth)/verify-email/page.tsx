import { Metadata } from "next"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"

export const metadata: Metadata = {
  title: "Verify Email | XII Luxury Timepieces",
  description:
    "Verify your email address to complete your XII account registration and access exclusive luxury timepiece collections.",
  openGraph: {
    title: "Verify Email | XII Luxury Timepieces",
    description:
      "Verify your email address to activate your XII luxury timepiece account.",
    type: "website",
  },
}

export default function VerifyEmailPage() {
  return <VerifyEmailForm />
}