"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { fetchUserRepos } from "@/modules/github/actions/index";
import { UserRepo } from "@/modules/github/actions/index";
import { RepoModalContent } from "@/modules/github/component/RepoModalContent";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AddRepo = () => {
    const { data: session } = useSession();
    const router = useRouter();

    // Modal open/close state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Data fetching state
    const [repos, setRepos] = useState<UserRepo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Import state
    const [isImporting, setIsImporting] = useState(false);

    //Fetches the user's repos when the modal is opened.

    const handleLoadRepos = async () => {
        if (!session?.accessToken) {
            setError("You must be signed with github to load repositories.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const userRepos = await fetchUserRepos(session.accessToken);

            setRepos(userRepos);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch repositories. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    //Called when a repo is selected from the modal.  This calls your API route to create the playground.
    const handleSelectRepo = async (repo: UserRepo) => {
        setIsImporting(true);
        try {
            const response = await fetch("/api/import/github", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    repoOwner: repo.owner.login,
                    repoName: repo.name,
                    description: "Imported form GITHUB",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to import repository");
            }

            const { playgroundId } = await response.json();
            router.refresh();
            // Success! Close modal and navigate to the new playground
            setIsModalOpen(false);

            router.push(`/playground/${playgroundId}`);
        } catch (err) {
            console.error(err);
            setError("Error importing repository. Please try again.");
            // We set isImporting to false here so the user can see the error
            setIsImporting(false);
        }
        // Don't set isImporting to false in a `finally` block,
        // as we want it to stay true during navigation.
    };

    /**
     * Handles opening/closing the modal.
     * Fetches data only when opening and data isn't already loaded.
     */
    const onModalOpenChange = (isOpen: boolean) => {
        setIsModalOpen(isOpen);
        if (isOpen && repos.length === 0 && !isLoading) {
            handleLoadRepos();
        }
        // If closing, reset error state
        if (!isOpen) {
            setError(null);
            setIsImporting(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onModalOpenChange}>
            <DialogTrigger asChild>
                <div
                    className="group px-6 py-6 flex flex-row justify-between items-center border rounded-lg bg-muted cursor-pointer 
     transition-all duration-300 ease-in-out
     hover:bg-background hover:border-[#E93F3F] hover:scale-[1.02]
     shadow-[0_2px_10px_rgba(0,0,0,0.08)]
     hover:shadow-[0_10px_30px_rgba(233,63,63,0.15)]"
                >
                    <div className="flex flex-row justify-center items-start gap-4">
                        <Button
                            variant={"outline"}
                            className="flex justify-center items-center bg-white group-hover:bg-[#fff8f8] group-hover:border-[#E93F3F] group-hover:text-[#E93F3F] transition-colors duration-300"
                            size={"icon"}
                        >
                            <ArrowDown
                                size={30}
                                className="transition-transform duration-300 group-hover:translate-y-1"
                            />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold text-[#e93f3f]">
                                Open Github Repository
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-[220px]">
                                Work with your repositories here
                            </p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden">
                        <Image
                            src={"/github.svg"}
                            alt="Open GitHub repository"
                            width={150}
                            height={150}
                            className="transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl">
                <RepoModalContent
                    isLoading={isLoading}
                    isImporting={isImporting}
                    error={error}
                    repos={repos}
                    onSelectRepo={handleSelectRepo}
                />
            </DialogContent>
        </Dialog>
    );
};

export default AddRepo;
