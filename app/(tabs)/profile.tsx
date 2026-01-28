import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { supabase } from '@/lib/supabase'

export default function Profile() {
    const { user } = useAuth()
    const router = useRouter()
    const colorScheme = useColorScheme() ?? 'light'
    const currentColors = Colors[colorScheme as keyof typeof Colors]
    const { language, setLanguage, t } = useLanguage()

    const onLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) Alert.alert('Error', error.message)
    }

    const [modalVisible, setModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const onDeleteAccount = () => {
        setDeleteModalVisible(true);
    }

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية (Arabic)' },
        { code: 'ha', name: 'Hausa' },
        { code: 'yo', name: 'Yoruba' },
    ];

    const handleLanguageSelect = (langCode: string) => {
        setLanguage(langCode as any);
        setModalVisible(false);
    };

    const getLanguageLabel = (lang: string) => {
        switch (lang) {
            case 'en': return 'English';
            case 'ar': return 'العربية';
            case 'ha': return 'Hausa';
            case 'yo': return 'Yoruba';
            default: return 'English';
        }
    }

    const MenuItem = ({ icon, title, delay, onPress, value }: { icon: string, title: string, delay: number, onPress?: () => void, value?: string }) => (
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {value && <Text style={{ color: currentColors.text + '80', marginRight: 10, fontSize: 14 }}>{value}</Text>}
                    <FontAwesome5 name="chevron-right" size={14} color={currentColors.text + '40'} />
                </View>
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
                <Text style={[styles.sectionTitle, { color: currentColors.text + '60' }]}>{t('profile_account')}</Text>
                <MenuItem
                    icon="globe"
                    title={t('profile_language')}
                    delay={100}
                    onPress={() => setModalVisible(true)}
                    value={getLanguageLabel(language)}
                />
                <MenuItem icon="history" title={t('chat_history') || "History"} delay={200} />

                <Text style={[styles.sectionTitle, { color: currentColors.text + '60', marginTop: 30 }]}>Account</Text>
                <MenuItem
                    icon="shield-alt"
                    title="Security & Password"
                    delay={300}
                    onPress={() => router.push('/(tabs)/change-password')}
                />
                <MenuItem icon="cog" title="Settings" delay={400} />

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: '#e74c3c20', marginBottom: 12 }]}
                    onPress={onLogout}
                >
                    <FontAwesome5 name="power-off" size={16} color="#e74c3c" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>{t('profile_logout')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDeleteAccount}
                >
                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>

            {/* Language Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={[styles.modalContent, { backgroundColor: currentColors.background }]}>
                        <Text style={[styles.modalTitle, { color: currentColors.text }]}>{t('profile_language')}</Text>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[styles.languageOption, language === lang.code && { backgroundColor: currentColors.tint + '20' }]}
                                onPress={() => handleLanguageSelect(lang.code)}
                            >
                                <Text style={[styles.languageText, { color: currentColors.text }]}>{lang.name}</Text>
                                {language === lang.code && <FontAwesome5 name="check" size={16} color={currentColors.tint} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            {/* Account Deletion Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setDeleteModalVisible(false)}>
                    <View style={[styles.modalContent, { backgroundColor: currentColors.background }]}>
                        <View style={styles.deleteModalIcon}>
                            <FontAwesome5 name="exclamation-triangle" size={30} color="#e74c3c" />
                        </View>
                        <Text style={[styles.modalTitle, { color: currentColors.text }]}>Delete Account?</Text>
                        <Text style={[styles.modalSubtitle, { color: currentColors.text + '90' }]}>
                            This action is permanent and cannot be undone. Are you sure you want to proceed?
                        </Text>

                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: currentColors.secondary }]}
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: currentColors.text }]}>No, Keep it</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#e74c3c' }]}
                                onPress={async () => {
                                    try {
                                        // 1. Call the custom RPC to delete the user record
                                        const { error: deleteError } = await supabase.rpc('delete_user');

                                        if (deleteError) {
                                            console.error('RPC Delete Error:', deleteError);
                                            Alert.alert('Deletion Failed', `Error: ${deleteError.message}\n\n${deleteError.details || ''}`);
                                            return;
                                        }

                                        // 2. Sign out locally
                                        await supabase.auth.signOut();

                                        setDeleteModalVisible(false);
                                        // 3. Navigate back to start
                                        router.replace('/');
                                    } catch (error) {
                                        console.error('Deletion Exception:', error);
                                        Alert.alert('Error', 'Failed to complete account deletion');
                                    }
                                }}
                            >
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Yes, Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
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
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
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
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.05)',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        borderRadius: 20,
        padding: 20,
        boxShadow: '0px 10px 30px rgba(0,0,0,0.2)',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    languageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 5,
    },
    languageText: {
        fontSize: 16,
        fontWeight: '500',
    },
    deleteButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#999',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    deleteModalIcon: {
        alignItems: 'center',
        marginBottom: 15,
    },
    modalSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    modalButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalButtonText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
})
