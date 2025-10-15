"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({
            where: { id: id },
            include: {
                accounts: true,
            },
        });
        return user;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const geAccountByUserId = async (userId: string) => {
    try {
        const account = await db.account.findFirst({
            where: { userId: userId },
        });
        return account;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const currentUser = async () => {
    const user = await auth();
    return user?.user;
};
