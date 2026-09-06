"use server"

import prisma from "../../../../lib/prisma"
import { LoginInput, loginSchema, RegisterInput, registerSchema } from "../_utils/schema"
import bcrypt from "bcryptjs"

const SALT = 10;

export const registerUser = async (data: RegisterInput): Promise<{ success: boolean, message: string }> => {
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

        await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
            }
        })

        return {
            success: true,
            message: "User created successfully",
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Something went wrong!",
        }
    }

}

export const loginUser = async (data: LoginInput): Promise<{ success: boolean, message: string }> => {
   try {
    const result = loginSchema.safeParse(data);
    if(!result.success) {
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

    if(!existingUser) {
        return {
            success: false,
            message: "Invalid credentials",
        }
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.passwordHash);

    if(!passwordMatch) {
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