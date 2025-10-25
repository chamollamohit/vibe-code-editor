"use server";

import Playground from "@/app/playground/[id]/page";
import { db } from "@/lib/db";
import { TemplateFolder, TemplateFile } from "../type";
import { currentUser } from "@/modules/auth/actions";

export const getAllPlaygroundById = async (id: string) => {
    try {
        const playground = await db.playground.findUnique({
            where: {
                id,
            },
            select: {
                title: true,
                source: true,
                repoOwner: true,
                templateFiles: {
                    select: {
                        content: true,
                    },
                },
            },
        });
        return playground;
    } catch (error) {
        console.log(error);
    }
};

export const saveUpdatedCode = async (
    playgroundId: string,
    data: TemplateFolder
) => {
    const user = await currentUser();
    if (!user) {
        return null;
    }

    try {
        const updatedPlayground = await db.templateFiles.upsert({
            where: {
                playgroundId,
            },
            update: {
                content: JSON.stringify(data),
            },
            create: {
                playgroundId,
                content: JSON.stringify(data),
            },
        });

        return updatedPlayground;
    } catch (error) {
        console.log(error);
    }
};
