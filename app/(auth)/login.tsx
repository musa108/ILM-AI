import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { supabase } from '@/lib/supabase'
import { FontAwesome5 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const colorScheme = useColorScheme() ?? 'light'
    const currentColors = Colors[colorScheme as keyof typeof Colors]

    const isFormValid = email.length > 0 && password.length > 0
    const primaryColor = isFormValid ? '#2ecc71' : currentColors.tint

    const onLoginPress = async () => {
        if (!isFormValid) return
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            router.replace('/(tabs)')
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
                        <View style={styles.header}>
                            <View style={styles.logoCircle}>
                                <FontAwesome5 name="mosque" size={40} color="#fff" />
                            </View>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>Continue your spiritual journey</Text>
                        </View>

                        <View style={styles.glassCard}>
                            <View style={styles.inputContainer}>
                                <FontAwesome5 name="envelope" size={16} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Email"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    style={styles.input}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <FontAwesome5 name="lock" size={16} color="rgba(255,255,255,0.6)" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Password"
                                    placeholderTextColor="rgba(255,255,255,0.4)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    style={[styles.input, { flex: 1 }]}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <FontAwesome5 name={showPassword ? "eye" : "eye-slash"} size={16} color="rgba(255,255,255,0.6)" />
                                </TouchableOpacity>
                            </View>

                            <Link href="/(auth)/forgot-password" asChild>
                                <TouchableOpacity style={styles.forgotLink}>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            </Link>

                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: primaryColor }]}
                                onPress={onLoginPress}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                            </TouchableOpacity>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account? </Text>
                                <Link href="/signup" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.linkText}>Sign Up</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
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
    forgotLink: {
        alignSelf: 'flex-end',
        marginTop: -8,
        marginBottom: 8,
    },
    forgotText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
    },
    linkText: {
        color: '#fff',
        fontWeight: 'bold',
    },
})
