"use server"

import { cookies } from "next/headers"
import { sendOTPEmail } from "../_utils/email"
import { ForgotPasswordInput, forgotPasswordSchema, ResetPasswordInput, resetPasswordSchema } from "../_utils/schema"
import { resetPasswordTemplate } from "../_utils/templates"
import { generateOTPAndHashedOTP, getHashedOTP } from "../_utils/OTP"
import { findUserByEmail } from "../_utils/user"
import { createVerificationCode, deleteVerificationCodeById, deleteVerificationCodes, getVerificationCode } from "../_utils/verificationCode"
import { createResetPasswordSession, deletePasswordSessionById, findPasswordSessionById, updateUserPassword, verifyResetPasswordSession } from "../_utils/passwordResetSession"
import { rateLimit } from "../_utils/rateLimit"


type AuthRes = Promise<{ success: boolean, message: string, data?: string }>;


export const forgotPassword = async (data: ForgotPasswordInput): AuthRes => {
    try {
        const result = forgotPasswordSchema.safeParse(data);

        if (!result.success) {
            return {
                success: false,
                message: "Invalid data"
            }
        }

        const { email } = result.data;

        const user = await findUserByEmail(email);

        if (!user) {
            return {
                success: false,
                message: "Invalid email"
            }
        }

        await deleteVerificationCodes(user.id, "PASSWORD_RESET");

        const [otp, otpHash] = generateOTPAndHashedOTP();

        await createVerificationCode({ userId: user.id, codeHash: otpHash, type: "PASSWORD_RESET" });

        const emailResult = await sendOTPEmail({ email, code: otp, template: resetPasswordTemplate });
        if (!emailResult.success) {
            return {
                success: false,
                message: "Failed to send email"
            }
        }

        await createResetPasswordSession(user.id);

        return {
            success: true,
            message: emailResult.message,
        }

    } catch (error) {
        console.log("error => ", error);
        return {
            success: false,
            message: "something went wrong!"
        }
    }
}

export const verifyForgotPasswordOTP = async (otp: string): AuthRes => {
    try {
        const cookieStore = await cookies();

        const sessionId = cookieStore
            .get("reset_password_session")
            ?.value;

        if (!sessionId) {
            return {
                success: false,
                message: "No session found!",
            };
        }

        const session = await findPasswordSessionById(sessionId);

        if (!session) {
            cookieStore.delete("reset_password_session");

            return {
                success: false,
                message: "Session not found",
            };
        }

        if (session.expiresAt <= new Date()) {
            await deletePasswordSessionById(sessionId);
            cookieStore.delete("reset_password_session");

            return {
                success: false,
                message: "Session expired",
            };
        }

        if (session.verifiedAt) {
            return {
                success: false,
                message: "Code already verified",
            };
        }

        const rateLimitResult = await rateLimit({
            key: `otp:password-reset:${session.userId}`,
            limit: 5,
            windowSeconds: 10 * 60,
        });

        if (!rateLimitResult.allowed) {
            return {
                success: false,
                message: "Too many attempts. Please try again later.",
            };
        }

        const submittedHash = getHashedOTP(otp);

        const verificationCode = await getVerificationCode({
            userId: session.userId,
            codeHash: submittedHash,
            type: "PASSWORD_RESET",
        })


        if (!verificationCode) {
            return {
                success: false,
                message: "Invalid or expired code",
            };
        }

        if (verificationCode.expiresAt <= new Date()) {
            await deleteVerificationCodeById(verificationCode.id);

            return {
                success: false,
                message: "Invalid or expired code",
            }
        }

        await verifyResetPasswordSession(sessionId, session.userId);

        return {
            success: true,
            message: "Code verified successfully",
        };
    } catch (error) {
        console.error("verifyForgotPasswordOTP error:", error);

        return {
            success: false,
            message: "Something went wrong!",
        };
    }
};


export const resendForgotPasswordOTP = async (): AuthRes => {
    try {
        const cookieStore = await cookies();

        const sessionId = cookieStore
            .get("reset_password_session")
            ?.value;

        if (!sessionId) {
            return {
                success: false,
                message: "No session found!",
            };
        }

        const session = await findPasswordSessionById(sessionId);

        if (!session) {
            cookieStore.delete("reset_password_session");

            return {
                success: false,
                message: "Session not found",
            };
        }

        if (session.expiresAt <= new Date()) {
            await deletePasswordSessionById(sessionId);

            cookieStore.delete("reset_password_session");

            return {
                success: false,
                message: "Session expired",
            };
        }

        if (session.verifiedAt) {
            return {
                success: false,
                message: "Password reset verification already completed",
            };
        }

        const rateLimitResult = await rateLimit({
            key: `otp:password-reset:${session.userId}`,
            limit: 3,
            windowSeconds: 10 * 60,
        });

        if (!rateLimitResult.allowed) {
            return {
                success: false,
                message: "Too many attempts. Please try again later.",
            };
        }

        await deleteVerificationCodes(session.userId, "PASSWORD_RESET");

        const [otp, otpHash] = generateOTPAndHashedOTP();

        await createVerificationCode({
            userId: session.userId,
            codeHash: otpHash,
            type: "PASSWORD_RESET",
        })

        const emailResult = await sendOTPEmail({
            email: session.user.email,
            code: otp,
            template: resetPasswordTemplate,
        });

        if (!emailResult.success) {
            return {
                success: false,
                message: "Failed to send email",
            };
        }

        return {
            success: true,
            message: "A new verification code has been sent.",
        };
    } catch (error) {
        console.error("resendForgotPasswordOTP error:", error);

        return {
            success: false,
            message: "Something went wrong!",
        };
    }
};

export const resetPassword = async (data: ResetPasswordInput): AuthRes => {
    try {
        const result = resetPasswordSchema.safeParse(data);

        if (!result.success) {
            return {
                success: false,
                message: "Invalid data",
            };
        }

        const { password } = result.data;

        const cookieStore = await cookies();

        const sessionId = cookieStore
            .get("reset_password_session")
            ?.value;

        if (!sessionId) {
            return {
                success: false,
                message: "No session found!",
            };
        }

        const session = await findPasswordSessionById(sessionId);

        if (!session) {
            cookieStore.delete("reset_password_session");

            return {
                success: false,
                message: "Session not found",
            };
        }

        if (session.expiresAt <= new Date()) {
            await deletePasswordSessionById(sessionId);
            cookieStore.delete("reset_password_session");

            return {
                success: false,
                message: "Session expired",
            };
        }

        if (!session.verifiedAt) {
            return {
                success: false,
                message:
                    "Password reset verification not completed",
            };
        }

        await updateUserPassword({
            userId: session.userId,
            password,
            sessionId
        });
        cookieStore.delete("reset_password_session");

        return {
            success: true,
            message: "Password reset successfully",
        };

    } catch (error) {
        console.error("resetPassword error:", error);
        return {
            success: false,
            message: "Something went wrong!",
        };
    }
}; 