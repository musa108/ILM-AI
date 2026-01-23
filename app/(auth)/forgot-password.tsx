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

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const router = useRouter()
    const colorScheme = useColorScheme() ?? 'light'
    const currentColors = Colors[colorScheme as keyof typeof Colors]

    const isEmailValid = email.length > 5 && email.includes('@')

    const onSendLink = async () => {
        if (!isEmailValid) return
        setLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'quranai://change-password'
            })
            if (error) throw error
            setSent(true)
            Alert.alert(
                'Email Sent',
                'Please check your inbox for a password reset link.',
                [{ text: 'OK', onPress: () => router.replace('/login') }]
            )
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
                    <Animated.View
                        entering={FadeInDown.duration(800).delay(200)}
                        style={styles.content}
                    >
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <FontAwesome5 name="arrow-left" size={20} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <View style={styles.logoCircle}>
                                <FontAwesome5 name="envelope" size={36} color="#fff" />
                            </View>
                            <Text style={styles.title}>Reset Password</Text>
                            <Text style={styles.subtitle}>
                                Enter your email and we'll send you a secure link to reset your password.
                            </Text>
                        </View>

                        <View style={styles.glassCard}>
                            <View style={styles.inputContainer}>
                                <FontAwesome5 name="envelope" size={16} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Email Address"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    style={styles.input}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: isEmailValid ? '#2ecc71' : currentColors.tint }]}
                                onPress={onSendLink}
                                disabled={loading || sent}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
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
    backButton: {
        position: 'absolute',
        top: 20,
        left: 0,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
        zIndex: 10,
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
    button: {
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
})
