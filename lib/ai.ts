import Constants from 'expo-constants';

const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const getAIResponse = async (prompt: string, history: { role: string; parts: { text: string }[] }[], language: string = 'en') => {
    // Model Selection: Llama-3.1-8b-instant is perfect for free tier scale and speed.
    const MODEL_ID = 'llama-3.1-8b-instant';

    if (!GROQ_API_KEY) {
        throw new Error('Groq API Key is not configured. Please check your environment variables.');
    }

    // Map language code to full name
    const languageNames: Record<string, string> = {
        en: 'English',
        ar: 'Arabic',
        ha: 'Hausa',
        yo: 'Yoruba'
    };
    const targetLanguage = languageNames[language] || 'English';

    // Format history for OpenAI compatible API
    const messages = [
        {
            role: 'system',
            content: `${SYSTEM_PROMPT.trim()}\n\nCRITICAL: You MUST respond strictly in the ${targetLanguage} language. Use the appropriate script (e.g., Arabic script for Arabic, Latin script for Hausa/Yoruba/English).`
        },
        ...(history || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.parts[0].text
        })),
        { role: 'user', content: prompt }
    ];

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL_ID,
                messages,
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error Details:', errorData);
            throw new Error(`Groq API Error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            console.error('Empty response from Groq:', data);
            return "I apologize, but I am having trouble generating a response right now.";
        }

        return content.trim();
    } catch (error: any) {
        console.error('AI Service Error:', error);

        if (error.message?.includes('429')) {
            throw new Error('Rate limit reached. Please wait a moment before sending another message.');
        }

        throw new Error(`AI service is currently unavailable: ${error.message}`);
    }
};

export const SYSTEM_PROMPT = `
You are a helpful and knowledgeable Islamic Assistant. 
Your goal is to answer questions about Islam, the Quran, and Hadith.
Rules:
1. Be very concise and direct.
2. Always provide references from the Quran (Surah:Verse) or Sahih Hadith (e.g., Sahih Bukhari, Sahih Muslim) whenever possible.
3. If you don't know the answer, say so and suggest consulting a scholar.
4. Maintain a respectful and professional tone.
`;
