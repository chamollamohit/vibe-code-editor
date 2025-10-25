// src/components/modals/RepoModalContent.tsx

import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRepo } from "@/modules/github/actions/index"; // Make sure this path is correct
import { Github, Loader2 } from "lucide-react";
import { useState } from "react";

interface RepoModalContentProps {
    isLoading: boolean;
    isImporting: boolean;
    error: string | null;
    repos: UserRepo[];
    onSelectRepo: (repo: UserRepo) => void;
}

export const RepoModalContent = ({
    isLoading,
    isImporting,
    error,
    repos,
    onSelectRepo,
}: RepoModalContentProps) => {
    // State to track which repo is being imported (for spinner)
    const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
    console.log(isImporting);
    const handleSelect = (repo: UserRepo) => {
        setSelectedRepoId(repo.id);
        onSelectRepo(repo);
    };

    return (
        <div className="relative">
            {isImporting && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 rounded-lg">
                    <Loader2 className="h-10 w-10 animate-spin text-[#E93F3F]" />
                    <p className="mt-4 text-lg font-medium">
                        Importing repository...
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Please wait.
                    </p>
                </div>
            )}
            <DialogHeader>
                <DialogTitle className="text-2xl">
                    Import GitHub Repository
                </DialogTitle>
                <DialogDescription>
                    Select a repository to import into a new playground.
                </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
                {isLoading ? (
                    // --- Loading State ---
                    <div className="h-[400px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="ml-3 text-muted-foreground">
                            Loading your repositories...
                        </p>
                    </div>
                ) : error ? (
                    // --- Error State ---
                    <div className="h-[400px] flex items-center justify-center text-destructive">
                        <p>{error}</p>
                    </div>
                ) : (
                    // --- Content State ---
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="flex flex-col gap-2">
                            {repos.map((repo) => (
                                <div
                                    key={repo.id}
                                    onClick={() => handleSelect(repo)}
                                    className="flex items-center justify-between p-3 rounded-lg border
                             hover:bg-muted transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <Github className="h-5 w-5" />
                                        <span className="font-medium">
                                            {repo.full_name}
                                        </span>
                                    </div>
                                    {isImporting &&
                                    selectedRepoId === repo.id ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : repo.private ? (
                                        <span className="text-xs font-semibold text-muted-foreground border rounded-full px-2 py-0.5">
                                            Private
                                        </span>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
};
