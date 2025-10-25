import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "../playground/type";

export interface UseWebContainerProps {
    templateData: TemplateFolder | null;
}

export interface UseWebContainerReturn {
    serverUrl: string | null;
    isLoading: boolean;
    error: string | null;
    instance: WebContainer | null;
    writeFileSync: (path: string, content: string) => Promise<void>;
    destroy: () => void;
}

export interface WebContainerPreviewProps {
    templateData: TemplateFolder;
    serverUrl: string;
    isLoading: boolean;
    error: string | null;
    instance: WebContainer | null;
    writeFileSync: (path: string, content: string) => Promise<void>;
    forceResetup?: boolean; // Optional prop to force re-setup
}

export interface TemplateItem {
    filename: string;
    fileExtension: string;
    content: string;
    folderName?: string;
    items?: TemplateItem[];
    type?: string;
    fullPath?: string;
}

export interface WebContainerFile {
    file: {
        contents: string;
    };
}

export interface WebContainerDirectory {
    directory: {
        [key: string]: WebContainerFile | WebContainerDirectory;
    };
}

export type WebContainerFileSystem = Record<
    string,
    WebContainerFile | WebContainerDirectory
>;
