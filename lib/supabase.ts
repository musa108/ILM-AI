import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import Constants from 'expo-constants';

// Try to get config from Constants.expoConfig.extra first, then fall back to process.env
const config = Constants.expoConfig?.extra || {};
const supabaseUrl = config.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = config.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// SSR-safe storage handling
const isWeb = Platform.OS === 'web';
const isServer = isWeb && typeof window === 'undefined';

// Provide a dummy storage for server-side to prevent "window is not defined" crashes
const storageShim = {
  getItem: (key: string) => (isServer ? null : AsyncStorage.getItem(key)),
  setItem: (key: string, value: string) => (isServer ? Promise.resolve() : AsyncStorage.setItem(key, value)),
  removeItem: (key: string) => (isServer ? Promise.resolve() : AsyncStorage.removeItem(key)),
};

// Validate that we have the required configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing!');
  console.error('URL:', supabaseUrl ? 'Present' : 'Missing');
  console.error('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
}

// Use the actual values or fallback to placeholder (will fail gracefully)
const finalSupabaseUrl = supabaseUrl || 'https://placeholder-url-if-missing.supabase.co';
const finalSupabaseAnonKey = supabaseAnonKey || 'placeholder-key-if-missing';

export const supabase = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    storage: storageShim as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
