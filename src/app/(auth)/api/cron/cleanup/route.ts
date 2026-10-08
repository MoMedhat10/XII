import { NextResponse } from "next/server";

import { logger } from "../../../../../../lib/pino";
import prisma from "../../../../../../lib/prisma";

export async function GET(request: Request) {
    logger.info({ url: request.url }, "Verification code cleanup cron started");

    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET;

    if (!authHeader || !expectedToken) {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || token !== expectedToken) {
        return NextResponse.json(
            {
                success: false,
                message: "Unauthorized",
            },
            { status: 401 }
        );
    }

    try {
        const result = await prisma.verificationCode.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        logger.info({ deleted: result.count }, "Verification code cleanup completed.");

        return NextResponse.json({
            success: true,
            message: "Cron executed successfully",
            deleted: result.count,
        });
    } catch (error) {
        logger.error(error, "Verification code cleanup failed");

        return NextResponse.json(
            {
                success: false,
                message: "Cron execution failed",
            },
            { status: 500 }
        );
    }
}