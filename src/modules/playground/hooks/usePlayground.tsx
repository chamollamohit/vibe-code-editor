import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PlaygroundData, TemplateFolder, UsePlaygroundReturn } from "../type";
import { getAllPlaygroundById, saveUpdatedCode } from "../actions";

export const usePlayground = (id: string): UsePlaygroundReturn => {
    const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(
        null
    );
    const [templateData, setTemplateData] = useState<TemplateFolder | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPlayground = useCallback(async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            setError(null);
            const data = await getAllPlaygroundById(id);

            setPlaygroundData(data!);
            const rawContent = data?.templateFiles?.[0]?.content;
            // load template from Database if saved there
            if (typeof rawContent === "string") {
                const parsedContent = JSON.parse(rawContent);
                setTemplateData(parsedContent);
                toast.success("Playground loaded Successfull !!");
                return;
            }

            // load template from api if not saved in content

            const res = await fetch(`/api/template/${id}`);

            if (!res.ok)
                throw new Error(`Failed to load template: ${res.status}`);

            const templateRes = await res.json();

            if (
                templateRes.templateJson &&
                Array.isArray(templateRes.templateJson)
            ) {
                setTemplateData({
                    folderName: "Root",
                    items: templateRes.templateJson,
                });
            } else {
                setTemplateData(
                    templateRes.templateJson || {
                        folderName: "Root",
                        items: [],
                    }
                );
            }
            toast.success("Template loaded successfully");
        } catch (error) {
            console.error("Error loading playground:", error);
            setError("Failed to load playground data");
            toast.error("Failed to load playground data");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const saveTemplateData = useCallback(
        async (data: TemplateFolder) => {
            try {
                await saveUpdatedCode(id, data);
                setTemplateData(data);
                toast.success("Changes saved successfully");
            } catch (error) {
                console.error("Error saving template data:", error);
                toast.error("Failed to save changes");
                throw error;
            }
        },
        [id]
    );

    useEffect(() => {
        loadPlayground();
    }, [loadPlayground]);

    return {
        playgroundData,
        templateData,
        isLoading,
        error,
        loadPlayground,
        saveTemplateData,
    };
};

// ("use client");

// import { useSession } from "next-auth/react";
// import { useState, useEffect } from "react";

// // Define a type for the repo object
// interface Repo {
//     name: string;
//     owner: string;
// }

// // Function to fetch the user's repos
// async function fetchUserRepos(accessToken: string): Promise<Repo[]> {
//     const response = await fetch(
//         "https://api.github.com/user/repos?type=owner",
//         {
//             headers: {
//                 // Use the user's token for authorization
//                 Authorization: `token ${accessToken}`,
//                 Accept: "application/vnd.github.v3+json",
//             },
//         }
//     );

//     if (!response.ok) {
//         throw new Error("Failed to fetch repositories");
//     }

//     const data = await response.json();
//     return data.map((repo: any) => ({
//         name: repo.name,
//         owner: repo.owner.login,
//     }));
// }

// // Your React Component
// export function RepoLoader() {
//     const { data: session, status } = useSession();
//     const [repos, setRepos] = useState<Repo[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const handleLoadRepos = async () => {
//         // Make sure we have a session and the access token
//         if (session?.user?.accessToken) {
//             setIsLoading(true);
//             setError(null);
//             try {
//                 const userRepos = await fetchUserRepos(
//                     session.user.accessToken
//                 );
//                 setRepos(userRepos);
//             } catch (err) {
//                 setError(
//                     err instanceof Error
//                         ? err.message
//                         : "An unknown error occurred"
//                 );
//             } finally {
//                 setIsLoading(false);
//             }
//         }
//     };

//     if (status === "loading") {
//         return <div>Loading session...</div>;
//     }

//     if (status === "unauthenticated") {
//         return <div>Please sign in to load your repos.</div>;
//     }

//     return (
//         <div>
//             <button onClick={handleLoadRepos} disabled={isLoading}>
//                 {isLoading ? "Loading..." : "Load My Repositories"}
//             </button>

//             {error && <div style={{ color: "red" }}>{error}</div>}

//             {/* Render the list of repos in a dropdown */}
//             <select>
//                 {repos.map((repo) => (
//                     <option key={repo.name} value={repo.name}>
//                         {repo.owner} / {repo.name}
//                     </option>
//                 ))}
//             </select>
//         </div>
//     );
// }
