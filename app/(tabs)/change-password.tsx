import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { supabase } from '@/lib/supabase'
import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ChangePassword() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const colorScheme = useColorScheme() ?? 'light'
    const currentColors = Colors[colorScheme]

    const isFormValid = newPassword.length >= 6 && newPassword === confirmPassword
    const primaryColor = isFormValid ? '#2ecc71' : currentColors.tint

    const onUpdatePassword = async () => {
        if (!isFormValid) return
        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })
            if (error) throw error
            Alert.alert('Success', 'Your password has been updated!', [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile') }])
        } catch (error: any) {
            Alert.alert('Error', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <LinearGradient
            colors={[currentColors.tint, currentColors.tint + 'CC', '#1a1a1a']}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <FontAwesome5 name="arrow-left" size={20} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Security</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <Animated.View
                        entering={FadeInDown.duration(800).delay(200)}
                        style={styles.content}
                    >
                        <View style={styles.header}>
                            <View style={styles.logoCircle}>
                                <FontAwesome5 name="lock" size={36} color="#fff" />
                            </View>
                            <Text style={styles.title}>Update Password</Text>
                            <Text style={styles.subtitle}>Enter your new password below</Text>
                        </View>

                        <View style={styles.glassCard}>
                            <View style={styles.inputContainer}>
                                <FontAwesome5 name="lock" size={16} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="New Password"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={16} color="rgba(255,255,255,0.6)" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <FontAwesome5 name="check-circle" size={16} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Confirm Password"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                    style={styles.input}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: primaryColor }]}
                                onPress={onUpdatePassword}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Set New Password'}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 8,
        textAlign: 'center',
    },
    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 30,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        gap: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 15,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#fff',
    },
    eyeIcon: {
        padding: 5,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.2)',
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
})
