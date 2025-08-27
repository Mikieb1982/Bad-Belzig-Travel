
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// API key must be set in the environment variable process.env.API_KEY
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a trip plan for Bad Belzig using the Gemini API.
 * @param interests - An array of strings representing the user's interests.
 * @param duration - A string describing the duration of the trip.
 * @param travelStyle - A string describing the user's preferred travel style.
 * @returns A promise that resolves to a markdown-formatted string of the generated trip plan.
 */
export const generateTripPlan = async (interests: string[], duration: string, travelStyle: string): Promise<string> => {
    const interestsText = interests.join(", ");
    const prompt = `Du bist ein freundlicher und sachkundiger Reiseführer für Bad Belzig, einen Kurort im Naturpark Hoher Fläming in Deutschland. Erstelle einen Vorschlag für einen Reiseplan für einen Besucher.
- Interessen des Besuchers: ${interestsText}.
- Aufenthaltsdauer: ${duration}.
- Bevorzugter Reisestil: ${travelStyle}.

Der Plan sollte klar gegliedert sein (z.B. nach Vormittag, Nachmittag, Abend oder Tag 1, Tag 2). Erwähne konkrete Orte wie die Burg Eisenhardt, die SteinTherme und den Naturpark Hoher Fläming. Gib auch Empfehlungen für Restaurants oder Cafés, wenn es passt. Halte den Ton einladend und begeisternd. Antworte auf Deutsch. Formatiere die Antwort mit Markdown für Überschriften, Listen und Fettdruck.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        
        if (!text) {
            console.warn("Gemini API returned an empty response text.");
            return "Leider konnte kein Plan erstellt werden. Die Antwort war leer.";
        }
        
        return text;

    } catch (error) {
        console.error("Error generating itinerary via Gemini API:", error);
        return "Ein Fehler ist aufgetreten. Bitte überprüfen Sie die Browser-Konsole für weitere Details und versuchen Sie es später erneut.";
    }
};


/**
 * Initializes and returns a Gemini chat instance for the "Ask a Local" feature.
 * @returns A Chat instance.
 */
export function startChat(): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'Du bist ein hilfsbereiter und freundlicher lokaler Führer für die Stadt Bad Belzig in Deutschland. Dein Wissen basiert auf den Informationen der offiziellen Tourismus-Website. Antworte auf Fragen prägnant und auf Deutsch. Wenn du Informationen aus dem Internet verwendest, um eine Frage zu beantworten, musst du deine Quellen nennen.',
            tools: [{ googleSearch: {} }],
        },
    });
}

/**
 * Sends a message to the chat and returns a streaming response.
 * @param chatInstance - The chat instance returned by startChat.
 * @param message - The user's message.
 * @returns An async iterator of GenerateContentResponse chunks.
 */
export async function sendMessageStream(chatInstance: Chat, message: string) {
    return await chatInstance.sendMessageStream({ message });
}
