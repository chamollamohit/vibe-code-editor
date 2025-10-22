import * as fs from "fs";
import * as path from "path";
import { ScanOptions, TemplateFolder, TemplateItem } from "../type";

/**
 * Scans a template directory and returns a structured JSON representation
 *
 * @param templatePath - Path to the template directory
 * @param options - Scanning options to customize behavior
 * @returns Promise resolving to the template structure as JSON
 */
export async function scanTemplateDirectory(
    templatePath: string,
    options: ScanOptions = {}
): Promise<TemplateFolder> {
    // Set default options
    const defaultOptions: ScanOptions = {
        ignoreFiles: [
            "package-lock.json",
            "yarn.lock",
            ".DS_Store",
            "thumbs.db",
            ".gitignore",
            ".npmrc",
            ".yarnrc",
            ".env",
            ".env.local",
            ".env.development",
            ".env.production",
        ],
        ignoreFolders: [
            "node_modules",
            ".git",
            ".vscode",
            ".idea",
            "dist",
            "build",
            "coverage",
        ],
        ignorePatterns: [
            /^\..+\.swp$/, // Vim swap files
            /^\.#/, // Emacs backup files
            /~$/, // Backup files
        ],
        maxFileSize: 1024 * 1024, // 1MB
    };

    // Merge provided options with defaults
    const mergedOptions: ScanOptions = {
        ignoreFiles: [
            ...(defaultOptions.ignoreFiles || []),
            ...(options.ignoreFiles || []),
        ],
        ignoreFolders: [
            ...(defaultOptions.ignoreFolders || []),
            ...(options.ignoreFolders || []),
        ],
        ignorePatterns: [
            ...(defaultOptions.ignorePatterns || []),
            ...(options.ignorePatterns || []),
        ],
        maxFileSize:
            options.maxFileSize !== undefined
                ? options.maxFileSize
                : defaultOptions.maxFileSize,
    };

    // Validate the input path
    if (!templatePath) {
        throw new Error("Template path is required");
    }

    // Check if the template path exists
    try {
        const stats = await fs.promises.stat(templatePath);
        if (!stats.isDirectory()) {
            throw new Error(`'${templatePath}' is not a directory`);
        }
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            throw new Error(
                `Template directory '${templatePath}' does not exist`
            );
        }
        throw error;
    }

    // Get the folder name from the path
    const folderName = path.basename(templatePath);

    // Process the directory and return the result
    return processDirectory(folderName, templatePath, mergedOptions);
}

/**
 * Process a directory and its contents recursively
 *
 * @param folderName - Name of the current folder
 * @param folderPath - Path to the current folder
 * @param options - Scanning options
 * @returns Promise resolving to a TemplateFolder object
 */
async function processDirectory(
    folderName: string,
    folderPath: string,
    options: ScanOptions
): Promise<TemplateFolder> {
    try {
        // Read directory contents
        const entries = await fs.promises.readdir(folderPath, {
            withFileTypes: true,
        });
        const items: TemplateItem[] = [];

        // Process each entry in the directory
        for (const entry of entries) {
            const entryName = entry.name;
            const entryPath = path.join(folderPath, entryName);

            // Check if this entry should be skipped
            if (entry.isDirectory()) {
                // Skip ignored folders
                if (options.ignoreFolders?.includes(entryName)) {
                    console.log(`Skipping ignored folder: ${entryPath}`);
                    continue;
                }

                // If it's a directory, process it recursively
                const subFolder = await processDirectory(
                    entryName,
                    entryPath,
                    options
                );
                items.push(subFolder);
            } else if (entry.isFile()) {
                // Skip ignored files
                if (options.ignoreFiles?.includes(entryName)) {
                    console.log(`Skipping ignored file: ${entryPath}`);
                    continue;
                }

                // Check against regex patterns
                const shouldSkip = options.ignorePatterns?.some((pattern) =>
                    pattern.test(entryName)
                );
                if (shouldSkip) {
                    console.log(
                        `Skipping file matching ignore pattern: ${entryPath}`
                    );
                    continue;
                }

                // If it's a file, get its details
                try {
                    const stats = await fs.promises.stat(entryPath);
                    const parsedPath = path.parse(entryName);
                    let content: string;

                    // Check file size before reading content
                    if (
                        options.maxFileSize &&
                        stats.size > options.maxFileSize
                    ) {
                        content = `[File content not included: size (${stats.size} bytes) exceeds maximum allowed size (${options.maxFileSize} bytes)]`;
                    } else {
                        content = await fs.promises.readFile(entryPath, "utf8");
                    }

                    items.push({
                        filename: parsedPath.name,
                        fileExtension: parsedPath.ext.replace(/^\./, ""), // Remove leading dot
                        content,
                    });
                } catch (error) {
                    console.error(`Error reading file ${entryPath}:`, error);
                    // Still include the file but with an error message as content
                    const parsedPath = path.parse(entryName);
                    items.push({
                        filename: parsedPath.name,
                        fileExtension: parsedPath.ext.replace(/^\./, ""),
                        content: `Error reading file: ${
                            (error as Error).message
                        }`,
                    });
                }
            }
            // Ignore other types of entries (symlinks, etc.)
        }

        // Return the folder with its items
        return {
            folderName,
            items,
        };
    } catch (error) {
        throw new Error(
            `Error processing directory '${folderPath}': ${
                (error as Error).message
            }`
        );
    }
}

/**
 * Saves the template structure to a JSON file
 *
 * @param templatePath - Path to the template directory
 * @param options - Scanning options
 * @returns Promise resolving to the template structure
 */
export async function getTemplateStructureAsJson(
    templatePath: string,
    options?: ScanOptions
): Promise<TemplateFolder> {
    try {
        // Scan the template directory
        const templateStructure = await scanTemplateDirectory(
            templatePath,
            options
        );
        return templateStructure;
    } catch (error) {
        throw new Error(
            `Error saving template structure: ${(error as Error).message}`
        );
    }
}
