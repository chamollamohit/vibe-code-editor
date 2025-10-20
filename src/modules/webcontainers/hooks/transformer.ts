import {
    TemplateItem,
    WebContainerDirectory,
    WebContainerFile,
    WebContainerFileSystem,
} from "../type";

export function transformToWebContainerFormat(template: {
    folderName: string;
    items: TemplateItem[];
}): WebContainerFileSystem {
    function processItem(
        item: TemplateItem
    ): WebContainerFile | WebContainerDirectory {
        if (item.folderName && item.items) {
            // This is a directory
            const directoryContents: WebContainerFileSystem = {};

            item.items.forEach((subItem) => {
                const key = subItem.fileExtension
                    ? `${subItem.filename}.${subItem.fileExtension}`
                    : subItem.folderName!;
                directoryContents[key] = processItem(subItem);
            });

            return {
                directory: directoryContents,
            };
        } else {
            // This is a file
            return {
                file: {
                    contents: item.content,
                },
            };
        }
    }

    const result: WebContainerFileSystem = {};

    template.items.forEach((item) => {
        const key = item.fileExtension
            ? `${item.filename}.${item.fileExtension}`
            : item.folderName!;
        result[key] = processItem(item);
    });

    return result;
}
1;
