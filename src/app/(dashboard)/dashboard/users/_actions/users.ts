"use server"

import type { Prisma } from "@/app/generated/prisma/client"
import { logger } from "../../../../../../lib/pino"
import prisma from "../../../../../../lib/prisma"
import { requireAdmin } from "../../../_server/require-admin"
import { fail, type ActionRes } from "../../../_utils/action-result"
import {
  userIdSchema,
  setSuspendedSchema,
  type UserIdInput,
  type SetSuspendedInput,
} from "../_utils/user-schema"

const GONE = "This user no longer exists."
const SELF = "You can't do this to your own account."
const ADMIN = "Admin accounts can't be changed here."

/** Thrown inside a transaction to roll it back with a message for the admin. */
class GuardError extends Error {}

/**
 * Loads the target inside the transaction and enforces the rules every
 * action shares. `destructive` actions (sign out, suspend, delete) only work
 * on customers, and never on the admin doing them.
 */
async function loadTarget(
  tx: Prisma.TransactionClient,
  adminId: string,
  id: string,
  { destructive }: { destructive: boolean }
) {
  const user = await tx.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      emailVerifiedAt: true,
      suspendedAt: true,
      _count: { select: { orders: true } },
    },
  })
  if (!user) throw new GuardError(GONE)
  if (destructive && user.id === adminId) throw new GuardError(SELF)
  if (destructive && user.role !== "CUSTOMER") throw new GuardError(ADMIN)
  return user
}

function actionFail(error: unknown, action: string) {
  if (error instanceof GuardError) return fail(error.message)
  logger.error({ error, action }, "user action failed")
  return fail("Something went wrong. Please try again.")
}

const audit = (adminId: string, userId: string, action: string) =>
  logger.info({ adminId, userId, action }, "admin user action")

/** Ends every session on every device (and any password reset in progress). */
export async function signOutEverywhere(
  input: UserIdInput
): Promise<ActionRes<{ signedOut: number }>> {
  const admin = await requireAdmin()
  const parsed = userIdSchema.safeParse(input)
  if (!parsed.success) return fail(GONE)
  const { id } = parsed.data

  try {
    const signedOut = await prisma.$transaction(async (tx) => {
      await loadTarget(tx, admin.id, id, { destructive: true })
      const { count } = await tx.session.deleteMany({ where: { userId: id } })
      await tx.passwordResetSession.deleteMany({ where: { userId: id } })
      return count
    })
    audit(admin.id, id, "sign-out-everywhere")
    return {
      success: true,
      message:
        signedOut === 0
          ? "No active sessions"
          : `Signed out of ${signedOut} session${signedOut === 1 ? "" : "s"}`,
      data: { signedOut },
    }
  } catch (error) {
    return actionFail(error, "signOutEverywhere")
  }
}

/** For a user whose code email never arrived: lets them sign in. */
export async function markEmailVerified(
  input: UserIdInput
): Promise<ActionRes<null>> {
  const admin = await requireAdmin()
  const parsed = userIdSchema.safeParse(input)
  if (!parsed.success) return fail(GONE)
  const { id } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const user = await loadTarget(tx, admin.id, id, { destructive: false })
      if (user.emailVerifiedAt) throw new GuardError("Already verified.")
      await tx.user.update({
        where: { id },
        data: { emailVerifiedAt: new Date() },
      })
      // the codes they were sent are useless now
      await tx.verificationCode.deleteMany({
        where: { userId: id, type: "EMAIL_VERIFICATION" },
      })
    })
    audit(admin.id, id, "mark-email-verified")
    return { success: true, message: "Email verified", data: null }
  } catch (error) {
    return actionFail(error, "markEmailVerified")
  }
}

/** Suspending signs them out now and blocks sign-in until unsuspended. */
export async function setSuspended(
  input: SetSuspendedInput
): Promise<ActionRes<{ suspended: boolean }>> {
  const admin = await requireAdmin()
  const parsed = setSuspendedSchema.safeParse(input)
  if (!parsed.success) return fail(GONE)
  const { id, suspended } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const user = await loadTarget(tx, admin.id, id, { destructive: true })
      if (suspended === !!user.suspendedAt) {
        throw new GuardError(
          suspended ? "Already suspended." : "Not suspended."
        )
      }
      await tx.user.update({
        where: { id },
        data: { suspendedAt: suspended ? new Date() : null },
      })
      if (suspended) {
        await tx.session.deleteMany({ where: { userId: id } })
        await tx.passwordResetSession.deleteMany({ where: { userId: id } })
      }
    })
    audit(admin.id, id, suspended ? "suspend" : "unsuspend")
    return {
      success: true,
      message: suspended ? "Suspended" : "Unsuspended",
      data: { suspended },
    }
  } catch (error) {
    return actionFail(error, "setSuspended")
  }
}

/**
 * Deletes the account. The schema's cascades remove the cart, wishlist,
 * sessions and codes; orders stay (Order.userId becomes null and
 * customerEmail keeps who placed them).
 */
export async function deleteUser(
  input: UserIdInput
): Promise<ActionRes<{ ordersKept: number }>> {
  const admin = await requireAdmin()
  const parsed = userIdSchema.safeParse(input)
  if (!parsed.success) return fail(GONE)
  const { id } = parsed.data

  try {
    const ordersKept = await prisma.$transaction(async (tx) => {
      const user = await loadTarget(tx, admin.id, id, { destructive: true })
      await tx.user.delete({ where: { id } })
      return user._count.orders
    })
    audit(admin.id, id, "delete")
    return { success: true, message: "User deleted", data: { ordersKept } }
  } catch (error) {
    return actionFail(error, "deleteUser")
  }
}
