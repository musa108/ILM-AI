import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl!
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey!

// SSR-safe storage handling
const isWeb = Platform.OS === 'web';
const isServer = isWeb && typeof window === 'undefined';

// Provide a dummy storage for server-side to prevent "window is not defined" crashes
const storageShim = {
  getItem: (key: string) => (isServer ? null : AsyncStorage.getItem(key)),
  setItem: (key: string, value: string) => (isServer ? Promise.resolve() : AsyncStorage.setItem(key, value)),
  removeItem: (key: string) => (isServer ? Promise.resolve() : AsyncStorage.removeItem(key)),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageShim as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
