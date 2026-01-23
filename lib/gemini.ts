import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!)

export const getGeminiResponse = async (prompt: string, history: { role: string; parts: { text: string }[] }[]) => {
    // Reverting to the most common model ID for standard Google AI Studio keys.
    // Trying gemini-1.5-flash-8b which is often more available on certain key types.
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const chat = model.startChat({
        history: history as any,
        generationConfig: {
            maxOutputTokens: 1000,
        },
    })

    const result = await chat.sendMessage(prompt)
    const response = await result.response
    return response.text()
}

export const SYSTEM_PROMPT = `
You are a helpful and knowledgeable Islamic Assistant. 
Your goal is to answer questions about Islam, the Quran, and Hadith.
Rules:
1. Be very concise and direct.
2. Always provide references from the Quran (Surah:Verse) or Sahih Hadith (e.g., Sahih Bukhari, Sahih Muslim) whenever possible.
3. If you don't know the answer, say so and suggest consulting a scholar.
4. Maintain a respectful and professional tone.
`
