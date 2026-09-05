import { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create Account | XII Luxury Timepieces",
  description:
    "Create an account with XII Luxury Timepieces to access exclusive releases, bespoke reservations, and orders management.",
  openGraph: {
    title: "Create Account | XII Luxury Timepieces",
    description:
      "Create an account with XII Luxury Timepieces to access exclusive global timepiece releases and orders management.",
    type: "website",
  },
}

export default function RegisterPage() {
  return <RegisterForm />
}