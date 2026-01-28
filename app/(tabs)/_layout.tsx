import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

import { useLanguage } from '@/context/LanguageContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? 'light']
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.tint,
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
          backgroundColor: currentColors.background,
          borderTopWidth: 0,
          elevation: 0,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_chat'),
          tabBarIcon: ({ color }: { color: string }) => <FontAwesome5 name="comment-alt" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: t('tab_quiz'),
          tabBarIcon: ({ color }: { color: string }) => <MaterialCommunityIcons name="brain" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: t('tab_prayer'),
          tabBarIcon: ({ color }: { color: string }) => <FontAwesome5 name="mosque" size={18} color={color} />,
        }}
      />
      <Tabs.Screen
        name="podcast"
        options={{
          title: t('tab_podcast'),
          tabBarIcon: ({ color }: { color: string }) => <FontAwesome5 name="podcast" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tab_profile'),
          tabBarIcon: ({ color }: { color: string }) => <FontAwesome5 name="user-alt" size={18} color={color} />,
        }}
      />
      <Tabs.Screen
        name="change-password"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
