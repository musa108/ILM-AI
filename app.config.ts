export default {
    expo: {
        name: "ILM AI",
        slug: "ilm-ai",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        scheme: "quranai",
        userInterfaceStyle: "automatic",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#0d5f5f"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.nmanagi22sorganization.ilmai",
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/icon.png",
                backgroundColor: "#0d5f5f"
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            package: "com.nmanagi22sorganization.ilmai"
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            "expo-font",
            "expo-audio",
            [
                "expo-notifications",
                {
                    "icon": "./assets/icon.png",
                    "color": "#0d5f5f"
                }
            ]
        ],
        extra: {
            router: {},
            eas: {
                projectId: "cc5d6114-03a3-4b50-af34-9027494519a5"
            },
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
            huggingfaceApiKey: process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY,
            groqApiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY
        },
        owner: "nmanagi22s-organization"
    }
};
