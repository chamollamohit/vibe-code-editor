"use client";
import React from "react";
import { useRef, useEffect, useCallback } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import { TemplateFile } from "../type";
import {
    configureMonaco,
    defaultEditorOptions,
    getEditorLanguage,
} from "../lib/editor-config";

import { PlaygroundEditorProps } from "../type";
import { useTheme } from "next-themes";

const PlaygroundEditor = ({
    activeFile,
    content,
    onContentChange,
}: PlaygroundEditorProps) => {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const handleEditorMount = (editor: any, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        console.log("Editor instance mounted:", !!editorRef.current);

        configureMonaco(monaco);
        updateEditorLanguage();
    };
    const { theme } = useTheme();
    const editorTheme = theme === "dark" ? "modern-dark" : "vs";

    const updateEditorLanguage = () => {
        if (!activeFile || !monacoRef.current || !editorRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;

        const language = getEditorLanguage(activeFile.fileExtension || "");

        try {
            monacoRef.current.editor.setModelLanguage(model, language);
        } catch (error) {
            console.warn("Failed to set editor language:", error);
        }
    };

    useEffect(() => {
        updateEditorLanguage();
    }, []);
    return (
        <div className="h-full relative">
            <Editor
                height={"100%"}
                value={content}
                onChange={(value) => onContentChange(value || "")}
                onMount={handleEditorMount}
                language={getEditorLanguage(activeFile?.fileExtension || "")}
                options={defaultEditorOptions}
                theme={editorTheme}
                path={`${activeFile?.filename}.${activeFile?.fileExtension}`}
            />
        </div>
    );
};

export default PlaygroundEditor;
