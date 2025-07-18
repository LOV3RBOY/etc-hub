
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentRequest } from "@google/genai";

// Ensure the API key is available as an environment variable
if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set. Please set it before running the application.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = "gemini-2.5-flash";

/**
 * Converts a File object to a base64 encoded string.
 */
function fileToGenerativePart(file: File): Promise<{mimeType: string, data: string}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64Data = dataUrl.split(',')[1];
            resolve({
                mimeType: file.type,
                data: base64Data
            });
        };
        reader.onerror = error => reject(error);
    });
}

export const generateSocialPost = async (prompt: string, imageFile?: File): Promise<string> => {
    try {
        const contents: GenerateContentRequest['contents'] = { parts: [{ text: prompt }] };

        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            const imageContentPart = { inlineData: imagePart };
            contents.parts.push(imageContentPart);
        }
        
        const systemInstruction = "You are a social media manager for a high-end beach club called 'Encore Beach Club'. Your tone is energetic, exclusive, and exciting. Generate 3-5 distinct, short, and catchy social media post captions. Include relevant emojis and hashtags like #EncoreBeachClub, #Vegas, #PoolParty, #EBC.";

        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                topP: 0.9,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating content with Gemini API:", error);
        if (error instanceof Error) {
           return `An error occurred: ${error.message}. Make sure your API key is configured correctly.`;
        }
        return "An unknown error occurred while generating the post.";
    }
};
