"use server"

import prisma from "../../../../lib/prisma"
import { sendVerificationEmail } from "../_utils/email"
import { LoginInput, loginSchema, RegisterInput, registerSchema } from "../_utils/schema"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const SALT = 10;

type AuthRes = Promise<{ success: boolean, message: string, data?: string }>;

export const registerUser = async (data: RegisterInput): AuthRes => {
    try {
        const result = registerSchema.safeParse(data)
        if (!result.success) {
            return {
                success: false,
                message: "Invalid data",
            }
        }

        const { username, email, password } = result.data;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return {
                    success: false,
                    message: "Username already exists",
                };
            }

            if (existingUser.email === email) {
                return {
                    success: false,
                    message: "Email already exists",
                };
            }
        }

        const hashedPassword = await bcrypt.hash(password, SALT);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
            }
        })

        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");


        await prisma.emailVerificationCode.create({
            data: {
                userId: user.id,
                codeHash: otpHash,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }
        })

        const emailResult = await sendVerificationEmail({ email, code: otp })

        if (!emailResult.success) {
            return {
                success: false,
                message: "Failed to send email",
            }
        }

        return {
            success: true,
            message: emailResult.message,
            data: user.id,
        }


    } catch (error) {
        console.log("error => ", error);
        return {
            success: false,
            message: "Something went wrong!",
        }
    }

}

export const loginUser = async (data: LoginInput): AuthRes => {
    try {
        const result = loginSchema.safeParse(data);
        if (!result.success) {
            return {
                success: false,
                message: "Invalid data",
            }
        }

        const { identifier, password } = result.data;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { email: identifier }
                ]
            }
        });

        if (!existingUser) {
            return {
                success: false,
                message: "Invalid credentials",
            }
        }

        if (!existingUser.emailVerifiedAt) {
            return {
                success: false,
                message: "Please verify your email first.",
            }
        }

        const passwordMatch = await bcrypt.compare(password, existingUser.passwordHash);

        if (!passwordMatch) {
            return {
                success: false,
                message: "Invalid credentials",
            }
        }

        return {
            success: true,
            message: `welcome back ${existingUser.username}!`,
        }

    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Something went wrong!",
        }
    }
}

export const verifyEmail = async (id: string, otp: string): AuthRes => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
        });

        if (!user) {
            return {
                success: false,
                message: "User not found!",
            };
        }

        if (user.emailVerifiedAt) {
            return {
                success: false,
                message: "Email already verified!",
            };
        }

        const submittedHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        const verificationCode =
            await prisma.emailVerificationCode.findFirst({
                where: {
                    userId: user.id,
                    codeHash: submittedHash,
                },
            });

        if (!verificationCode) {
            return {
                success: false,
                message: "Invalid verification code",
            };
        }

        if (new Date() > verificationCode.expiresAt) {
            await prisma.emailVerificationCode.delete({
                where: {
                    id: verificationCode.id,
                },
            });

            return {
                success: false,
                message: "Verification code expired",
            };
        }

        await prisma.$transaction([
            prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    emailVerifiedAt: new Date(),
                },
            }),

            prisma.emailVerificationCode.delete({
                where: {
                    id: verificationCode.id,
                },
            }),
        ]);

        return {
            success: true,
            message: "Email verified successfully",
        };
    } catch (error) {
        console.error("verifyEmail error:", error);

        return {
            success: false,
            message: "Something went wrong!",
        };
    }
};

export const resendEmailVerificationCode = async (id: string): AuthRes => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
        });

        if (!user) {
            return {
                success: false,
                message: "User not found!",
            };
        }

        if (user.emailVerifiedAt) {
            return {
                success: false,
                message: "Email already verified!",
            };
        }


        await prisma.emailVerificationCode.deleteMany({
            where: {
                userId: user.id,
            },
        });

        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");


        await prisma.emailVerificationCode.create({
            data: {
                userId: user.id,
                codeHash: otpHash,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }
        });

        const emailResult = await sendVerificationEmail({ email: user.email, code: otp })

        if (!emailResult.success) {
            return {
                success: false,
                message: "Failed to send email",
            }
        }

        return {
            success: true,
            message: "code resent successfully"
        }

    } catch (error) {
        console.log("error => ", error);
        return {
            success: false,
            message: "Something went wrong!",
        }
    }
}
