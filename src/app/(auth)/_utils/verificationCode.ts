import prisma from "../../../../lib/prisma";

type VerificationCodeType = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

type CreateVerificationCodeType = {
    userId: string;
    codeHash: string;
    type: VerificationCodeType;
}


export const createVerificationCode = async ({ userId, codeHash, type }: CreateVerificationCodeType) => {
    const TEN_MINUTES_EXPIRATION = new Date(Date.now() + 10 * 60 * 1000);

    return prisma.verificationCode.create({
        data: {
            userId,
            codeHash,
            type,
            expiresAt: TEN_MINUTES_EXPIRATION
        }
    })
}


export const getVerificationCode = async ({ userId, codeHash, type }: CreateVerificationCodeType) => {
    return prisma.verificationCode.findFirst({
        where: {
            userId,
            codeHash,
            type,
        },
    })
}

export const deleteVerificationCodeById = async (id: string) => {
    return await prisma.verificationCode.delete({
        where: {
            id,
        },
    });
}


export const updateUserStateTransaction = async (userId: string , verificationCodeId: string) => {
    return await prisma.$transaction([
            prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    emailVerifiedAt: new Date(),
                },
            }),

            prisma.verificationCode.delete({
                where: {
                    id: verificationCodeId,
                },
            }),
        ]);
}


export const deleteVerificationCodes = async (userId: string , type: VerificationCodeType ) => {
    return await prisma.verificationCode.deleteMany({
            where: {
                userId,
                type
            },
        });
}
    