"use client";

import { Button } from "@/components/ui/button";

import { StarIcon, StarOffIcon } from "lucide-react";
import { useState, useEffect, forwardRef } from "react";
import { toast } from "sonner";
import { toggleStarMarked } from "../actions";
import React from "react";
import { MarkedToggleButtonProps } from "../types";

const MarkedToggleButton = forwardRef<
    HTMLButtonElement,
    MarkedToggleButtonProps
>(({ markedForRevision, id, onClick, className, children, ...props }, ref) => {
    const [isMarked, setIsMarked] = useState(markedForRevision);

    useEffect(() => {
        setIsMarked(markedForRevision);
    }, [markedForRevision]);

    const handleToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
        // Call the original onClick if provided by the parent (DropdownMenuItem)
        onClick?.(event);
        console.log(markedForRevision);

        const newMarkedState = !isMarked;

        setIsMarked(newMarkedState);

        try {
            const res = await toggleStarMarked(id, newMarkedState);
            const { success, error, isMarked } = res;

            //    if ismarked true then show marked successfully otherwise show start over
            if (isMarked && !error && success) {
                toast.success("Added to Favorites successfully");
            } else {
                toast.success("Removed from Favorites successfully");
            }
        } catch (error) {
            console.error("Failed to toggle mark for revision:", error);
            setIsMarked(!newMarkedState); // Revert state if the update fails
            toast.error("Failed to updated Favourites");
        }
    };

    return (
        <Button
            ref={ref}
            variant="ghost"
            className={`flex items-center justify-start w-full px-2 py-1.5 text-sm rounded-md cursor-pointer ${className}`}
            onClick={handleToggle}
            {...props}
        >
            {isMarked ? (
                <StarIcon size={16} className="text-red-500 mr-2" />
            ) : (
                <StarOffIcon size={16} className="text-gray-500 mr-2" />
            )}
            {children || (isMarked ? "Remove Favorite" : "Add to Favorite")}
        </Button>
    );
});

export default MarkedToggleButton;
