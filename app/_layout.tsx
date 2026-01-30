import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { setupNotifications } from '@/lib/notifications';

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, loading]);

  useEffect(() => {
    setupNotifications();
  }, []);

  useEffect(() => {
    if (loading || !loaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isOnboarding = (segments[0] as string) === 'onboarding';

    if (!user) {
      if (!inAuthGroup && !isOnboarding) {
        router.replace('/onboarding' as any);
      }
    } else if (user && (inAuthGroup || isOnboarding)) {
      router.replace('/(tabs)' as any);
    }
  }, [user, loading, loaded, segments]);

  // Handle Password Recovery & Signup Verification redirection
  useEffect(() => {
    let authListener: any = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((event: any) => {
        console.log('Auth event change:', event);
        if (event === 'PASSWORD_RECOVERY') {
          router.replace('/(tabs)/change-password');
        } else if (event === 'SIGNED_IN') {
          router.replace('/(tabs)');
        }
      });
      authListener = data?.subscription;
    } catch (e) {
      console.error("Layout auth listener error:", e);
    }

    return () => {
      if (authListener) authListener.unsubscribe();
    }
  }, [router]);

  if (!loaded || loading) {
    return null;
  }

  return <RootLayoutNav />;
}

import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <InitialLayout />
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
