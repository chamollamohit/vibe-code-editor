export interface User {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    template: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user: User;
    Starmark: { isMarked: boolean }[];
}

export interface ProjectTableProps {
    projects: Project[];
    onUpdateProject?: (
        id: string,
        data: { title: string; description: string }
    ) => Promise<void>;
    onDeleteProject?: (id: string) => Promise<void>;
    onDuplicateProject?: (id: string) => Promise<void>;
    onMarkasFavorite?: (id: string) => Promise<void>;
}

export interface EditProjectData {
    title: string;
    description: string;
}

export interface TemplateOption {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    popularity: number;
    tags: string[];
    features: string[];
    category: "frontend" | "backend" | "fullstack";
}

export type TemplateSelectionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
        description?: string;
    }) => void;
};
