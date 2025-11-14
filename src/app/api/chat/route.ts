import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatRequest {
    message: string;
    history: ChatMessage[];
}

async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
        console.error("GOOGLE_API_KEY environment variable is not set");
        throw new Error("AI service is not configured");
    }
    const genAI = new GoogleGenerativeAI(API_KEY);

    const systemPrompt = `You are a helpful AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice  
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: systemPrompt,
    });

    const newUserMessage = messages[messages.length - 1];
    const historyMessages = messages.slice(0, -1);

    const geminiHistory: Content[] = historyMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
    }));

    const generationConfig = {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1000,
    };

    try {
        const chat = model.startChat({
            history: geminiHistory,
            generationConfig: generationConfig,
        });

        const result = await chat.sendMessage(newUserMessage.content);
        const response = result.response;

        if (
            !response ||
            !response.candidates ||
            response.candidates.length === 0
        ) {
            throw new Error("No response candidate found from AI model");
        }

        const text = response.text();
        if (!text) {
            throw new Error("Empty response from AI model");
        }

        return text.trim();
    } catch (error) {
        console.error("AI generation error:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Failed to generate AI response";
        throw new Error(errorMessage);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body: ChatRequest = await req.json();
        const { message, history = [] } = body;

        // Validate input
        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required and must be a string" },
                { status: 400 }
            );
        }

        // Validate history format
        const validHistory = Array.isArray(history)
            ? history.filter(
                  (msg) =>
                      msg &&
                      typeof msg === "object" &&
                      typeof msg.role === "string" &&
                      typeof msg.content === "string" &&
                      ["user", "assistant"].includes(msg.role)
              )
            : [];

        const recentHistory = validHistory.slice(-10);

        const messages: ChatMessage[] = [
            ...recentHistory,
            { role: "user", content: message },
        ];

        //   Generate ai response

        const aiResponse = await generateAIResponse(messages);

        return NextResponse.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Chat API Error:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                error: "Failed to generate AI response",
                details: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
