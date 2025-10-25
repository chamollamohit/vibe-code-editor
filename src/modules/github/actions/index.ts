export interface GitRepoFile {
    type: "file";
    filename: string;
    fileExtension: string;
    fullPath: string; // Full path for API calls (e.g., "src/main.ts")
    sha: string;
    content: string;
}

export interface GitRepoFolder {
    type: "folder";
    folderName: string;
    items: GitRepoItem[]; // Contains files and sub-folders
}

export type GitRepoItem = GitRepoFile | GitRepoFolder;
const GITHUB_API = "https://api.github.com";

export interface UserRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
        login: string;
    };
    default_branch: string;
}

interface RepoDetails {
    default_branch: string;
}

export interface TreeEntry {
    path: string;
    type: "blob" | "tree"; // "blob" is a file, "tree" is a folder
    sha: string;
    url: string;
    size?: number;
}

interface TreeResponse {
    sha: string;
    url: string;
    tree: TreeEntry[];
    truncated: boolean;
}

interface FileContentResponse {
    name: string;
    path: string;
    content: string; // This will be a Base64 encoded string
    encoding: "base64";
}

function getGitHubHeaders(accessToken: string) {
    return {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
    };
}

// --- API Functions ---

export async function fetchUserRepos(accessToken: string): Promise<UserRepo[]> {
    const url = `${GITHUB_API}/user/repos?sort=updated&per_page=100`;

    try {
        const res = await fetch(url, {
            headers: getGitHubHeaders(accessToken),
        });

        if (!res.ok) {
            throw new Error(
                `Failed to fetch user repos: ${res.status} ${res.statusText}`
            );
        }

        const data: UserRepo[] = await res.json();
        return data;
    } catch (error) {
        console.error("Error in fetchUserRepos:", error);
        throw error; // Re-throw so the component can catch it
    }
}

export async function fetchRepoTree(
    owner: string,
    repo: string,
    accessToken: string
): Promise<TreeEntry[]> {
    try {
        // 1. Get the default branch
        const repoDetailsUrl = `${GITHUB_API}/repos/${owner}/${repo}`;
        const repoRes = await fetch(repoDetailsUrl, {
            headers: getGitHubHeaders(accessToken),
        });

        if (!repoRes.ok) {
            throw new Error(
                `Failed to fetch repo details: ${repoRes.statusText}`
            );
        }

        const repoDetails = (await repoRes.json()) as RepoDetails;

        const defaultBranch = repoDetails.default_branch;

        // 2. Get the recursive tree for that branch
        const treeUrl = `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
        const treeRes = await fetch(treeUrl, {
            headers: getGitHubHeaders(accessToken),
        });

        if (!treeRes.ok) {
            throw new Error(`Failed to fetch repo tree: ${treeRes.statusText}`);
        }

        const treeData = (await treeRes.json()) as TreeResponse;

        // Filter out folders ("tree") and only return files ("blob")
        const files = treeData.tree.filter((entry) => entry.type === "blob");

        return files;
    } catch (error) {
        console.error("Error in fetchRepoTree:", error);
        throw error;
    }
}

export async function fetchFileContent(
    owner: string,
    repo: string,
    path: string,
    accessToken: string
): Promise<string> {
    try {
        const fileUrl = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
        const res = await fetch(fileUrl, {
            headers: getGitHubHeaders(accessToken),
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch file content: ${res.statusText}`);
        }

        const data = (await res.json()) as FileContentResponse;

        // The content is Base64 encoded. We need to decode it.
        // atob() is a built-in browser function for decoding Base64.
        const decodedContent = atob(data.content);

        return decodedContent;
    } catch (error) {
        console.error("Error in fetchFileContent:", error);
        throw error;
    }
}

export function buildRepoTree(
    files: TreeEntry[],
    repoName: string
): GitRepoFolder {
    const root: GitRepoFolder = {
        type: "folder",
        folderName: repoName,
        items: [],
    };

    const folderMap = new Map<string, GitRepoFolder>();
    folderMap.set("", root); // Add root

    for (const file of files) {
        const pathParts = file.path.split("/");
        let currentFolder = root;
        let currentPath = "";

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];

            if (i === pathParts.length - 1) {
                // This is the file
                const fileDetails = parseFileName(part);
                currentFolder.items.push({
                    type: "file",
                    ...fileDetails,
                    fullPath: file.path, // Full path for API calls
                    sha: file.sha,
                    content: "",
                });
            } else {
                // This is a directory
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                let existingFolder = folderMap.get(currentPath);

                if (!existingFolder) {
                    const newFolder: GitRepoFolder = {
                        type: "folder",
                        folderName: part,
                        items: [],
                    };
                    currentFolder.items.push(newFolder);
                    folderMap.set(currentPath, newFolder);
                    existingFolder = newFolder;
                }
                currentFolder = existingFolder;
            }
        }
    }

    sortTree(root);
    return root;
}

function parseFileName(filename: string): {
    filename: string;
    fileExtension: string;
} {
    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex === -1 || dotIndex === 0) {
        return { filename: filename, fileExtension: "" };
    }
    return {
        filename: filename.substring(0, dotIndex),
        fileExtension: filename.substring(dotIndex + 1),
    };
}

function sortTree(folder: GitRepoFolder) {
    folder.items.sort((a, b) => {
        if (a.type === "folder" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "folder") return 1;

        const aName = a.type === "folder" ? a.folderName : a.filename;
        const bName = b.type === "folder" ? b.folderName : b.filename;
        return aName.localeCompare(bName);
    });

    // Recurse for subfolders
    for (const item of folder.items) {
        if (item.type === "folder") {
            sortTree(item);
        }
    }
}
