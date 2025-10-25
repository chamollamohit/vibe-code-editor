import { auth } from "@/auth"; // Your Auth.js config
import { db } from "@/lib/db"; // Your Prisma client
import { fetchRepoTree } from "@/modules/github/actions/index";
import { buildRepoTree } from "@/modules/github/actions/index";
import { Prisma } from "@prisma/client";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // 1. Get user session and access token
        const session = await auth();
        if (!session?.user?.id || !session.accessToken) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 2. Get data from the client
        const body = await req.json();
        const { repoOwner, repoName, description } = body;

        if (!repoOwner || !repoName) {
            return new NextResponse("Missing repo data", { status: 400 });
        }

        // 3. Fetch the file tree from GitHub
        const fileList = await fetchRepoTree(
            repoOwner,
            repoName,
            session.accessToken
        );

        // 4. Build the JSON structure (with empty content)
        const treeJson = buildRepoTree(fileList, repoName);

        // 5. Create the Playground and TemplateFiles in a transaction
        const newPlayground = await db.playground.create({
            data: {
                title: repoName,
                description: description || "Imported from GitHub",
                userId: session.user.id,
                template: "GITHUB",
                source: "GITHUB",
                repoOwner: repoOwner,
                templateFiles: {
                    create: {
                        content: treeJson as unknown as Prisma.JsonObject,
                    },
                },
            },
        });

        // 6. Return the new playground ID
        return NextResponse.json(
            { playgroundId: newPlayground.id },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to import GitHub repo:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
