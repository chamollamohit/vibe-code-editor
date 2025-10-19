import { create } from "zustand";
import { toast } from "sonner";

import { TemplateFile, TemplateFolder } from "../type";

interface OpenFile extends TemplateFile {
    id: string;
    hasUnsavedChanges: boolean;
    content: string;
    originalContent: string;
}

interface FileExplorerState {
    playgroundId: string;
    templateData: TemplateFolder | null;
    openFiles: OpenFile[];
    activeFileId: string | null;
    editorContent: string;
}

// @ts-ignore
export const useFileExplorer = create<FileExplorerState>((set, get) => ({
    templateData: null,
    playgroundId: "",
    openFiles: [] satisfies OpenFile[],
    activeFileId: null,
    editorContent: "",

    setTemplateData: (data) => set({ templateData: data }),
    setPlaygroundId(id) {
        set({ playgroundId: id });
    },
    setEditorContent: (content) => set({ editorContent: content }),
    setOpenFiles: (files) => set({ openFiles: files }),
    setActiveFileId: (fileId) => set({ activeFileId: fileId }),

    openFile: (file) => {
        const fileId = generateFileId(file, get().templateData!);
        const { openFiles } = get();
        const existingFile = openFiles.find((f) => f.id === fileId);

        if (existingFile) {
            set({ activeFileId: fileId, editorContent: existingFile.content });
            return;
        }

        const newOpenFile: OpenFile = {
            ...file,
            id: fileId,
            hasUnsavedChanges: false,
            content: file.content || "",
            originalContent: file.content || "",
        };

        set((state) => ({
            openFiles: [...state.openFiles, newOpenFile],
            activeFileId: fileId,
            editorContent: file.content || "",
        }));
    },
}));
