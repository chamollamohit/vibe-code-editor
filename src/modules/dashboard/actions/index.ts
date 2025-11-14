"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { createPlaygroundProp } from "../types";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
export const getAllPlaygroundForUser = async () => {
    noStore();
    const user = await currentUser();

    try {
        const playgrounds = db.playground.findMany({
            where: {
                userId: user?.id,
            },
            include: {
                user: true,
                starMark: {
                    where: {
                        userId: user?.id,
                    },
                    select: {
                        isMarked: true,
                    },
                },
            },
        });
        return playgrounds;
        // revalidatePath("/dashboard");
    } catch (error) {
        console.log("Unable to get all Playground");
    }
};

export const createPlayground = async (data: createPlaygroundProp) => {
    const user = await currentUser();
    const { template, title, description } = data;

    if (!user || !user.id) {
        console.log("User not found, cannot create Playground");

        throw new Error("User not authorized");
    }

    try {
        const playground = await db.playground.create({
            data: {
                title: title,
                description: description,
                template: template,
                userId: user?.id,
            },
        });

        return playground;
    } catch (error) {
        console.log("Unable to create Playground");
    }
};

export const detedPlaygroundById = async (id: string) => {
    try {
        await db.playground.delete({
            where: {
                id,
            },
        });
        revalidatePath("/dashboard");
    } catch (error) {
        console.log("Unable to delete Playground");
    }
};

export const editPlaygroundById = async (
    id: string,
    data: { title: string; description: string }
) => {
    try {
        await db.playground.update({
            where: {
                id,
            },
            data: {
                ...data,
            },
        });
        revalidatePath("/dashboard");
    } catch (error) {
        console.log("Unable to edit Playground");
    }
};

export const dupicatePlaygroundById = async (id: string) => {
    try {
        const originalPlayground = await db.playground.findUnique({
            where: {
                id,
            },
        });
        if (!originalPlayground) {
            throw new Error("Original Playground not found");
        }

        const duplicatePlayground = await db.playground.create({
            data: {
                title: `${originalPlayground.title} (copy)`,
                description: originalPlayground.description,
                template: originalPlayground.template,
                userId: originalPlayground.userId,

                // Todo Add Template filed
            },
        });
        revalidatePath("/dashboard");
        return duplicatePlayground;
    } catch (error) {
        console.log("Unable to Duplicate Playground");
    }
};

export const toggleStarMarked = async (
    playgroundId: string,
    isChecked: boolean
) => {
    const user = await currentUser();
    const userId = user?.id;
    if (!userId) {
        throw new Error("User Id is required");
    }

    try {
        if (isChecked) {
            await db.starMark.create({
                data: {
                    userId: userId,
                    playgroundId: playgroundId,
                    isMarked: isChecked,
                },
            });
        } else {
            await db.starMark.delete({
                where: {
                    userId_playgroundId: {
                        userId,
                        playgroundId: playgroundId,
                    },
                },
            });
        }
        revalidatePath("/dashboard");

        return { success: true, isMarked: isChecked };
    } catch (error) {
        console.error("Error Updating favorites:", error);
        return { success: false, error: "Failed to update favourites" };
    }
};
