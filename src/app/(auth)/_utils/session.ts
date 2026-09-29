import crypto from "crypto";
import prisma from "../../../../lib/prisma";
import { cookies } from "next/headers";

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;


export const createSession = async (userId: string, rememberMe: boolean) => {
    const sessionId = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + (rememberMe ? THIRTY_DAYS_IN_MS : SEVEN_DAYS_IN_MS));

    await prisma.session.create({
        data: {
            id: sessionId,
            userId,
            expiresAt,
        },
    });

    const cookieStore = await cookies();

    cookieStore.set("xii_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    });
};


export const getCurrentUser = async () => {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("xii_session")?.value;

        if (!sessionId) {
            return null;
        }

        const session = await prisma.session.findUnique({
            where: {
                id: sessionId,
            },
            include: {
                user: true,
            },
        });


        if (!session) {
            return null;
        }


        if (new Date() >= session.expiresAt) {
            await prisma.session.delete({
                where: {
                    id: session.id,
                }
            })

            cookieStore.delete("xii_session");
            return null;
        }
 
        return session.user;

    } catch (error) {
        console.log("error => ", error);
        return null;
    }
}


export const deleteSession = async (sessionId: string) => {
    return await prisma.session.deleteMany({
            where: {
                id: sessionId,
            }
        })
}