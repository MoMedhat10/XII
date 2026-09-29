import prisma from "../../../../lib/prisma";
import crypto from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs"


const TEN_MINUTES = 10 * 60 * 1000;
const SALT = 10;

export const createResetPasswordSession = async (userId: string) => {
    const sessionId = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TEN_MINUTES);

    await prisma.passwordResetSession.create({
        data: {
            id: sessionId,
            userId,
            expiresAt,
        },
    });

    const cookieStore = await cookies();

    cookieStore.set("reset_password_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    });

}


export const findPasswordSessionById = async (sessionId: string) => {
    return await prisma.passwordResetSession.findUnique({
        where: {
            id: sessionId,
        },
        include: {
            user: true,
        },
    });
}


export const deletePasswordSessionById = async (sessionId: string) => {
    return await prisma.passwordResetSession.delete({
        where: {
            id: sessionId,
        },
    });
}


export const verifyResetPasswordSession = async (sessionId: string, userId: string) => {
    await prisma.$transaction([
        prisma.verificationCode.deleteMany({
            where: {
                userId: userId,
                type: "PASSWORD_RESET",
            },
        }),

        prisma.passwordResetSession.update({
            where: {
                id: sessionId,
            },
            data: {
                verifiedAt: new Date(),
            },
        }),
    ]);
}


export const updateUserPassword = async ({ userId, sessionId, password }: { userId: string, sessionId: string, password: string }) => {

    const hashedPassword = await bcrypt.hash(
        password,
        SALT
    );

    return await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                passwordHash: hashedPassword,
            },
        });

        // Invalidate all existing login sessions.
        await tx.session.deleteMany({
            where: {
                userId: userId,
            },
        });

        // Consume the reset session.
        await tx.passwordResetSession.delete({
            where: {
                id: sessionId,
            },
        });
    });
}