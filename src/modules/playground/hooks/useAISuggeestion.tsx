import { Monaco } from "@monaco-editor/react";
import { isLastDayOfMonth } from "date-fns";
import { editor } from "monaco-editor";
import { useState, useCallback } from "react";

interface AISuggestionsState {
    suggestion: string | null;
    isLoading: boolean;
    position: { line: number; column: number } | null;
    decoration: string[];
    isEnabled: boolean;
}

interface UseAISuggestionsReturn extends AISuggestionsState {
    toggleEnabled: () => void;
    fetchSuggestion: (type: string, editor: any) => Promise<void>;
    acceptSuggestion: (editor: any, monaco: any) => void;
    rejectSuggestion: (editor: any) => void;
    clearSuggestion: (editor: any) => void;
}

export const useAISuggestions = (): UseAISuggestionsReturn => {
    const [state, setState] = useState<AISuggestionsState>({
        suggestion: null,
        isLoading: false,
        position: null,
        decoration: [],
        isEnabled: true,
    });

    const toggleEnabled = useCallback(() => {
        setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
    }, []);

    const fetchSuggestion = useCallback(
        async (type: string, editor: editor.IStandaloneCodeEditor) => {
            setState((currentState) => {
                if (!currentState.isEnabled) {
                    return currentState;
                }
                if (!editor) {
                    return currentState;
                }

                const model = editor.getModel();
                const cursorPosition = editor.getPosition();

                if (!model || !cursorPosition) {
                    return currentState;
                }

                const newState = { ...currentState, isLoading: true };

                (async () => {
                    try {
                        const payload = {
                            fileContent: model.getValue(),
                            cursorLine: cursorPosition.lineNumber - 1,
                            cursorColumn: cursorPosition.column - 1,
                            suggestionType: type,
                        };

                        const respone = await fetch("/api/code-completion", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                        });
                        if (!respone.ok) {
                            throw new Error(
                                `API responded with Status ${respone.status}`
                            );
                        }

                        const data = await respone.json();

                        if (data.suggestion) {
                            const suggestionText = data.suggestion.trim();
                            setState((prev) => ({
                                ...prev,
                                suggestion: suggestionText,
                                position: {
                                    line: cursorPosition.lineNumber,
                                    column: cursorPosition.column,
                                },
                                isLoading: false,
                            }));
                        } else {
                            console.warn("No suggestion received from API.");
                            setState((prev) => ({ ...prev, isLoading: false }));
                        }
                    } catch (error) {
                        console.error("Error fetching code suggestion:", error);
                        setState((prev) => ({ ...prev, isLoading: false }));
                    }
                })();

                return newState;
            });
        },
        []
    );

    const acceptSuggestion = useCallback(() => {
        (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
            setState((currentState) => {
                if (
                    !currentState.suggestion ||
                    !currentState.position ||
                    !editor ||
                    !monaco
                ) {
                    return currentState;
                }

                const { line, column } = currentState.position;
                const sanitizedSuggestion = currentState.suggestion.replace(
                    /^\d+:\s*/gm,
                    ""
                );

                editor.executeEdits("", [
                    {
                        range: new monaco.Range(line, column, line, column),
                        text: sanitizedSuggestion,
                        forceMoveMarkers: true,
                    },
                ]);

                if (editor && currentState.decoration.length > 0) {
                    editor.deltaDecorations(currentState.decoration, []);
                }

                return {
                    ...currentState,
                    suggestion: null,
                    position: null,
                    decoration: [],
                };
            });
        };
    }, []);

    const rejectSuggestion = useCallback(
        (editor: editor.IStandaloneCodeEditor) => {
            setState((currentState) => {
                if (editor && currentState.decoration.length > 0) {
                    editor.deltaDecorations(currentState.decoration, []);
                }

                return {
                    ...currentState,
                    suggestion: null,
                    position: null,
                    decoration: [],
                };
            });
        },
        []
    );

    const clearSuggestion = useCallback(
        (editor: editor.IStandaloneCodeEditor) => {
            setState((currentState) => {
                if (editor && currentState.decoration.length > 0) {
                    editor.deltaDecorations(currentState.decoration, []);
                }
                return {
                    ...currentState,
                    suggestion: null,
                    position: null,
                    decoration: [],
                };
            });
        },
        []
    );

    return {
        ...state,
        toggleEnabled,
        fetchSuggestion,
        acceptSuggestion,
        rejectSuggestion,
        clearSuggestion,
    };
};
