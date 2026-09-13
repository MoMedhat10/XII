import { Metadata } from "next"
import ResetPasswordForm from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password | XII Luxury Timepieces",
  description:
    "Set a new secure password for your XII Luxury Timepieces account to protect your collection and orders.",
  openGraph: {
    title: "Reset Password | XII Luxury Timepieces",
    description:
      "Set a new secure password for your XII Luxury Timepieces account to protect your collection and orders.",
    type: "website",
  },
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}