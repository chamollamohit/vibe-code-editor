import { Button } from "@/components/ui/button";
import { $Enums } from "@prisma/client";

export interface User {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Project {
    id: string;
    title: string;
    description: string | null;
    template: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user: User;
    starMark: { isMarked: boolean }[];
}

export interface ProjectTableProps {
    projects: Project[];
    onUpdateProject?: (
        id: string,
        data: { title: string; description: string }
    ) => Promise<void>;
    onDeleteProject?: (id: string) => Promise<void>;
    onDuplicateProject?: (id: string) => Promise<
        | {
              id: string;
              createdAt: Date;
              updatedAt: Date;
              userId: string;
              title: string;
              description: string | null;
              template: $Enums.Templates;
          }
        | undefined
    >;
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

export interface createPlaygroundProp {
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
    description?: string;
}

export interface MarkedToggleButtonProps
    extends React.ComponentPropsWithoutRef<typeof Button> {
    markedForRevision: boolean;
    id: string;
}
