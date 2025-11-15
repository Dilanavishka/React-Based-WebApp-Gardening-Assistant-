
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a helpful and friendly gardening assistant. Provide concise and accurate information about plants and gardening techniques.',
        }
    });
};

export const analyzeImage = async (imageBase64: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: prompt,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        if (error instanceof Error) {
            return `An error occurred while analyzing the image: ${error.message}`;
        }
        return "An unknown error occurred while analyzing the image.";
    }
};
