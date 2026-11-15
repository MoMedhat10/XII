import "server-only"

/**
 * The sender for every email. Resend's sandbox address (the fallback) only
 * delivers to the Resend account owner, so production sets EMAIL_FROM to an
 * address on a domain verified in Resend.
 */
export const EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() || "XII <onboarding@resend.dev>"
