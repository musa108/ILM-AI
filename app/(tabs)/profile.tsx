import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Profile() {
    const { user } = useAuth()
    const router = useRouter()
    const colorScheme = useColorScheme() ?? 'light'
    const currentColors = Colors[colorScheme as keyof typeof Colors]

    const onLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) Alert.alert('Error', error.message)
    }

    const MenuItem = ({ icon, title, delay, onPress }: { icon: string, title: string, delay: number, onPress?: () => void }) => (
        <Animated.View entering={FadeInDown.delay(delay).duration(600)}>
            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: currentColors.secondary }]}
                onPress={onPress}
                disabled={!onPress}
            >
                <View style={styles.menuLeft}>
                    <View style={[styles.menuIconContainer, { backgroundColor: currentColors.tint + '15' }]}>
                        <FontAwesome5 name={icon} size={18} color={currentColors.tint} />
                    </View>
                    <Text style={[styles.menuText, { color: currentColors.text }]}>{title}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color={currentColors.text + '40'} />
            </TouchableOpacity>
        </Animated.View>
    )

    return (
        <ScrollView style={[styles.container, { backgroundColor: currentColors.background }]} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={[currentColors.tint, currentColors.tint + 'CC']}
                style={styles.profileHeader}
            >
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={styles.avatarGlow}>
                            <View style={[styles.avatar, { backgroundColor: '#fff' }]}>
                                <FontAwesome5 name="user-alt" size={40} color={currentColors.tint} />
                            </View>
                        </View>
                        <Text style={styles.title}>{user?.user_metadata?.username || 'User'}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.content}>
                <Text style={[styles.sectionTitle, { color: currentColors.text + '60' }]}>Activity</Text>
                <MenuItem icon="history" title="Quiz History" delay={100} />
                <MenuItem icon="bookmark" title="Saved Verses" delay={200} />

                <Text style={[styles.sectionTitle, { color: currentColors.text + '60', marginTop: 30 }]}>Account</Text>
                <MenuItem
                    icon="shield-alt"
                    title="Security & Password"
                    delay={300}
                    onPress={() => router.push('/(tabs)/change-password')}
                />
                <MenuItem icon="cog" title="Settings" delay={400} />

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: '#e74c3c20' }]}
                    onPress={onLogout}
                >
                    <FontAwesome5 name="power-off" size={16} color="#e74c3c" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileHeader: {
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: 40,
    },
    avatarGlow: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    email: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    content: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    logoutText: {
        color: '#e74c3c',
        fontSize: 16,
        fontWeight: 'bold',
    },
    versionText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 30,
        fontSize: 12,
    },
})
