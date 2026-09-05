import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In | XII Luxury Timepieces",
  description:
    "Sign in to your XII account to explore exclusive haute horlogerie collections, manage your saved timepieces, and track your orders.",
  openGraph: {
    title: "Sign In | XII Luxury Timepieces",
    description:
      "Sign in to your XII account to access your global luxury timepiece collection.",
    type: "website",
  },
}

export default function LoginPage() {
  return <LoginForm />
}