import { editor } from "monaco-editor";

/**
 * Represents a file in the template structure
 */
export interface TemplateFile {
    filename: string;
    fileExtension: string;
    content: string;
}

/**
 * Represents a folder in the template structure which can contain files and other folders
 */
export interface TemplateFolder {
    folderName: string;
    items: (TemplateFile | TemplateFolder)[];
}

/**
 * Type representing either a file or folder in the template structure
 */
export type TemplateItem = TemplateFile | TemplateFolder;

/**
 * Options for scanning template directories
 */
export interface ScanOptions {
    /**
     * Files to ignore (exact filenames with extensions)
     */
    ignoreFiles?: string[];

    /**
     * Folders to ignore (exact folder names)
     */
    ignoreFolders?: string[];

    /**
     * File patterns to ignore (regex patterns)
     */
    ignorePatterns?: RegExp[];

    /**
     * Maximum size of file to include content (in bytes)
     * Files larger than this will have a placeholder message instead of content
     */
    maxFileSize?: number;
}

export interface PlaygroundData {
    id: string;
    title?: string;
    [key: string]: any;
}

export interface UsePlaygroundReturn {
    playgroundData: PlaygroundData | null;
    templateData: TemplateFolder | null;
    isLoading: boolean;
    error: string | null;
    loadPlayground: () => Promise<void>;
    saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

export interface TemplateFileTreeProps {
    data: TemplateItem;
    onFileSelect?: (file: TemplateFile) => void;
    selectedFile?: TemplateFile;
    title?: string;
    onAddFile?: (file: TemplateFile, parentPath: string) => void;
    onAddFolder?: (folder: TemplateFolder, parentPath: string) => void;
    onDeleteFile?: (file: TemplateFile, parentPath: string) => void;
    onDeleteFolder?: (folder: TemplateFolder, parentPath: string) => void;
    onRenameFile?: (
        file: TemplateFile,
        newFilename: string,
        newExtension: string,
        parentPath: string
    ) => void;
    onRenameFolder?: (
        folder: TemplateFolder,
        newFolderName: string,
        parentPath: string
    ) => void;
}

export interface TemplateNodeProps {
    item: TemplateItem;
    onFileSelect?: (file: TemplateFile) => void;
    selectedFile?: TemplateFile;
    level: number;
    path?: string;
    onAddFile?: (file: TemplateFile, parentPath: string) => void;
    onAddFolder?: (folder: TemplateFolder, parentPath: string) => void;
    onDeleteFile?: (file: TemplateFile, parentPath: string) => void;
    onDeleteFolder?: (folder: TemplateFolder, parentPath: string) => void;
    onRenameFile?: (
        file: TemplateFile,
        newFilename: string,
        newExtension: string,
        parentPath: string
    ) => void;
    onRenameFolder?: (
        folder: TemplateFolder,
        newFolderName: string,
        parentPath: string
    ) => void;
}

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

    //   Setter Functions
    setPlaygroundId: (id: string) => void;
    setTemplateData: (data: TemplateFolder | null) => void;
    setEditorContent: (content: string) => void;
    setOpenFiles: (files: OpenFile[]) => void;
    setActiveFileId: (fileId: string | null) => void;

    //   Functions
    openFile: (file: TemplateFile) => void;
    closeFile: (fileId: string) => void;
    closeAllFiles: () => void;

    // File explorer methods
    handleAddFile: (
        newFile: TemplateFile,
        parentPath: string,
        writeFileSync: (filePath: string, content: string) => Promise<void>,
        instance: any,
        saveTemplateData: (data: TemplateFolder) => Promise<void>
    ) => Promise<void>;

    handleAddFolder: (
        newFolder: TemplateFolder,
        parentPath: string,
        instance: any,
        saveTemplateData: (data: TemplateFolder) => Promise<void>
    ) => Promise<void>;

    handleDeleteFile: (
        file: TemplateFile,
        parentPath: string,
        saveTemplateData: (data: TemplateFolder) => Promise<void>
    ) => Promise<void>;
    handleDeleteFolder: (
        folder: TemplateFolder,
        parentPath: string,
        saveTemplateData: (data: TemplateFolder) => Promise<void>
    ) => Promise<void>;
    handleRenameFile: (
        file: TemplateFile,
        newFilename: string,
        newExtension: string,
        parentPath: string,
        saveTemplateData: (data: TemplateFolder) => Promise<void>
    ) => Promise<void>;
    handleRenameFolder: (
        folder: TemplateFolder,
        newFolderName: string,
        parentPath: string,
        saveTemplateData: (data: TemplateFolder) => Promise<void>
    ) => Promise<void>;

    updateFileContent: (fileId: string, content: string) => void;
}

export interface PlaygroundEditorProps {
    activeFile: TemplateFile | undefined;
    content: string;
    onContentChange: (value: string) => void;
}

export type IStandaloneEditorConstructionOptions =
    editor.IStandaloneEditorConstructionOptions;
