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
