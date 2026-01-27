import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';


export default function Onboarding() {
    const { width, height } = Dimensions.get('window');
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const currentColors = Colors[colorScheme as keyof typeof Colors];

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <Animated.View
                entering={FadeInUp.delay(200).duration(1000)}
                style={styles.header}
            >
                <FontAwesome5 name="mosque" size={80} color={currentColors.tint} />
                <Text style={[styles.title, { color: currentColors.text }]}>
                    ILM AI</Text>
                <Text style={[styles.subtitle, { color: currentColors.text + '80' }]}>
                    Your Intelligent Islamic Companion
                </Text>
            </Animated.View>

            <Animated.View
                entering={FadeInDown.delay(400).duration(1000)}
                style={styles.features}
            >
                <View style={styles.featureItem}>
                    <View style={[styles.iconContainer, { backgroundColor: currentColors.secondary }]}>
                        <FontAwesome5 name="comment-dots" size={20} color={currentColors.tint} />
                    </View>
                    <View>
                        <Text style={[styles.featureTitle, { color: currentColors.text }]}>AI Assistant</Text>
                        <Text style={[styles.featureDesc, { color: currentColors.text + '60' }]}>Get concise answers with references.</Text>
                    </View>
                </View>

                <View style={styles.featureItem}>
                    <View style={[styles.iconContainer, { backgroundColor: currentColors.secondary }]}>
                        <FontAwesome5 name="brain" size={20} color={currentColors.tint} />
                    </View>
                    <View>
                        <Text style={[styles.featureTitle, { color: currentColors.text }]}>Islamic Quiz</Text>
                        <Text style={[styles.featureDesc, { color: currentColors.text + '60' }]}>Test and grow your knowledge.</Text>
                    </View>
                </View>

                <View style={styles.featureItem}>
                    <View style={[styles.iconContainer, { backgroundColor: currentColors.secondary }]}>
                        <FontAwesome5 name="podcast" size={20} color={currentColors.tint} />
                    </View>
                    <View>
                        <Text style={[styles.featureTitle, { color: currentColors.text }]}>Islamic podcast</Text>
                        <Text style={[styles.featureDesc, { color: currentColors.text + '60' }]}>Listen to islamic insight and gain knowledge.</Text>
                    </View>
                </View>
            </Animated.View>

            <Animated.View
                entering={FadeInDown.delay(600).duration(1000)}
                style={styles.footer}
            >
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: currentColors.tint }]}
                    onPress={() => router.replace('/signup')}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginLink}
                    onPress={() => router.replace('/login')}
                >
                    <Text style={[styles.loginText, { color: currentColors.text + '80' }]}>
                        Already have an account? <Text style={{ color: currentColors.tint, fontWeight: 'bold' }}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        justifyContent: 'space-between',
    },
    header: {
        alignItems: 'center',
        paddingTop: '20%',
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        marginTop: 20,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 18,
        marginTop: 5,
    },
    features: {
        gap: 30,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    featureDesc: {
        fontSize: 14,
        marginTop: 2,
    },
    footer: {
        paddingBottom: '10%',
        gap: 15,
    },
    button: {
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.2)',
        elevation: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginLink: {
        alignItems: 'center',
    },
    loginText: {
        fontSize: 16,
    },
});
