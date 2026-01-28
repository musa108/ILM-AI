import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager, Platform } from 'react-native';

import { ar } from '@/constants/translations/ar';
import { en } from '@/constants/translations/en';
import { ha } from '@/constants/translations/ha';
import { yo } from '@/constants/translations/yo';

// Define the available languages
export type Language = 'en' | 'ar' | 'ha' | 'yo';

const translations = {
    en,
    ar,
    ha,
    yo,
};

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: string) => string;
    isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        if (Platform.OS === 'web' && typeof window === 'undefined') return;

        try {
            const storedLang = await AsyncStorage.getItem('user-language');
            if (storedLang) {
                setLanguageState(storedLang as Language);
            }
        } catch (error) {
            console.log('Error loading language', error);
        }
    };

    const setLanguage = async (lang: Language) => {
        try {
            setLanguageState(lang);
            await AsyncStorage.setItem('user-language', lang);

            // Handle RTL for Arabic
            const isRTL = lang === 'ar';
            if (I18nManager.isRTL !== isRTL) {
                I18nManager.allowRTL(isRTL);
                I18nManager.forceRTL(isRTL);
                // Updates.reloadAsync(); // Reloading might be too aggressive, let's try dynamic update
                // Note: In React Native, RTL changes often require a reload to apply everywhere properly.
                // For now, we will just set the state, but suggest a reload if layout looks broken.
            }
        } catch (error) {
            console.log('Error saving language', error);
        }
    };

    const t = (key: string) => {
        const translation = (translations[language] as any)[key];
        return translation || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === 'ar' }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
