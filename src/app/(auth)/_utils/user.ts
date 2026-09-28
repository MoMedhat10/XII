import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs"



const SALT = 10;
type CreateUserType = {
    username: string;
    email: string;
    password: string;
}


export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where: {
            email
        } 
    });
} 

export const findUserById = async (id: string) => {
    return await prisma.user.findUnique({
        where: {
            id
        }
    }); 
}

export const findExistingUser = async (username: string, email: string) => {
    return await prisma.user.findFirst({
        where: {
            OR: [
                { username },
                { email }
            ]
        }
    }); 
} 


export const createUser = async ({username , email , password}: CreateUserType) => {
   const hashedPassword = await bcrypt.hash(password, SALT);

        return await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
            }
        })
} 