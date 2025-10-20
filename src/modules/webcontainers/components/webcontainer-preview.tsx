"use client";
import React, { useEffect, useState, useRef } from "react";

import { transformToWebContainerFormat } from "../hooks/transformer";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "@/modules/playground/type";
import { WebContainerPreviewProps } from "../type";

const WebContainerPreview = ({
    error,
    instance,
    isLoading,
    serverUrl,
    templateData,
    writeFileSync,
    forceResetup,
}: WebContainerPreviewProps) => {
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [loadingState, setLoadingState] = useState({
        transforming: false,
        mounting: false,
        installing: false,
        starting: false,
        ready: false,
    });
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 4;
    const [setupError, setSetupError] = useState<string | null>(null);
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [isSetupInProgress, setIsSetupInProgress] = useState(false);

    return <div>WebContainerPreview</div>;
};

export default WebContainerPreview;
