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
