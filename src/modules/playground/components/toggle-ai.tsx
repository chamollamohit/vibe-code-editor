"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Bot,
    Code,
    FileText,
    Import,
    Loader2,
    Power,
    PowerOff,
    Braces,
    Variable,
} from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { AIChatSidePanel } from "@/modules/ai-chat/components/ai-chat-sidebar-pannel";
// import { AIChatSidePanel } from "@/features/ai-chat/components/ai-chat-sidepanel";

const ToggleAI: React.FC = ({}) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        variant={"default"}
                        className={cn(
                            "relative gap-2 h-8 px-3 text-sm font-medium transition-all duration-200",
                            "bg-zinc-900 hover:bg-zinc-800 text-zinc-50 border-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200"
                        )}
                        onClick={(e) => e.preventDefault()}
                    >
                        <Bot className="h-4 w-4" />

                        <span>AI</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                    <DropdownMenuLabel className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                AI Assistant
                            </span>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setIsChatOpen(true)}
                        className="py-2.5 cursor-pointer"
                    >
                        <div className="flex items-center gap-3 w-full">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <div className="text-sm font-medium">
                                    Open Chat
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Chat with AI assistant
                                </div>
                            </div>
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AIChatSidePanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />
        </>
    );
};

export default ToggleAI;
