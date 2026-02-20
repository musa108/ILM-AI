import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { useLanguage } from '@/context/LanguageContext'
import { getAIResponse } from '@/lib/ai'
import { FontAwesome5 } from '@expo/vector-icons'
import * as Speech from 'expo-speech'
import React, { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Podcast() {
    const [topic, setTopic] = useState('')
    const [isPlaying, setIsPlaying] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentScript, setCurrentScript] = useState('')
    const [suggestedTopics, setSuggestedTopics] = useState<string[]>([])
    const [topicsLoading, setTopicsLoading] = useState(false)

    const { language, t } = useLanguage()
    const colorScheme = useColorScheme() ?? 'light'
    const currentColors = Colors[colorScheme as keyof typeof Colors]

    const checkVoices = async () => {
        try {
            const voices = await Speech.getAvailableVoicesAsync()
            console.log('Podcast: Available voices count:', voices.length)
            if (voices.length === 0) {
                console.warn('Podcast: No voices available on this device.')
            }
        } catch (e) {
            console.error('Podcast: Error checking voices:', e)
        }
    }

    const generateTopics = async () => {
        setTopicsLoading(true)
        try {
            const prompt = "Generate 5 short, engaging 1-3 word titles for Islamic podcast topics. Return strictly a comma-separated list. Example: Patience, Zakat, Afterlife, Prayer, Hajj."
            const response = await getAIResponse(prompt, [], language)
            const topics = response.split(',').map((t: string) => t.trim()).slice(0, 5)
            setSuggestedTopics(topics)
        } catch (e) {
            console.error('Error generating topics', e)
            setSuggestedTopics(["Patience", "Prayer", "Zakat", "Hajj", "Fasting"])
        } finally {
            setTopicsLoading(false)
        }
    }

    React.useEffect(() => {
        generateTopics()
        checkVoices()
    }, [])

    const generatePodcast = async (selectedTopic: string) => {
        setLoading(true)
        setIsPlaying(false)
        Speech.stop()

        try {
            const prompt = `Write a short, engaging 2-minute podcast script about "${selectedTopic}" in Islam. 
      Style: Conversational, warm, and informative. 
      Format: Just the spoken text, no speaker labels or sound effect cues. 
      Start directly with a greeting and introduction in the selected language.`

            const script = await getAIResponse(prompt, [], language)
            setCurrentScript(script)
            // Removed automatic speak(script) to comply with browser autoplay policies
            // User will now manually click "Play" to listen.
        } catch (error) {
            console.error('Error generating podcast:', error)
        } finally {
            setLoading(false)
        }
    }

    const getBestVoice = async (lang: string) => {
        try {
            const voices = await Speech.getAvailableVoicesAsync()
            // Map common codes to regional ones for better picking
            const localeMap: Record<string, string> = {
                'en': 'en-US',
                'yo': 'yo-NG',
                'ha': 'ha-NG',
                'ar': 'ar-SA'
            }
            const targetLocale = localeMap[lang] || lang

            // Prioritize: 
            // 1. Exact locale match + 'enhanced' or 'premium' or 'google' (high quality)
            // 2. Exact locale match
            // 3. Language match (e.g. 'yo')

            const filteredVoices = voices.filter(v => v.language.toLowerCase().includes(lang.toLowerCase()))

            if (filteredVoices.length === 0) return null

            const premiumVoice = filteredVoices.find(v =>
                v.quality === Speech.VoiceQuality.Enhanced ||
                v.name.toLowerCase().includes('premium') ||
                v.name.toLowerCase().includes('google')
            )

            return premiumVoice?.identifier || filteredVoices[0].identifier
        } catch (e) {
            return null
        }
    }

    const speak = async (text: string) => {
        console.log('Podcast: Attempting to speak text of length:', text.length)
        setIsPlaying(true)

        const voiceIdentifier = await getBestVoice(language)
        const localeMap: Record<string, string> = {
            'en': 'en-US',
            'yo': 'yo-NG',
            'ha': 'ha-NG',
            'ar': 'ar-SA'
        }

        Speech.speak(text, {
            language: localeMap[language] || language,
            voice: voiceIdentifier || undefined,
            pitch: 1.0,
            rate: 0.9,
            onStart: () => {
                console.log('Speech started')
                setIsPlaying(true)
            },
            onDone: () => {
                console.log('Speech done')
                setIsPlaying(false)
            },
            onStopped: () => {
                console.log('Speech stopped')
                setIsPlaying(false)
            },
            onError: (error) => {
                console.error('Speech error:', error)
                setIsPlaying(false)
            }
        })
    }

    const togglePlayback = () => {
        if (isPlaying) {
            Speech.stop()
            setIsPlaying(false)
        } else {
            if (currentScript) {
                speak(currentScript)
            }
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: currentColors.text }]}>ILM AI Podcast</Text>
                <Text style={[styles.subtitle, { color: currentColors.text + '80' }]}>Listen to AI-generated Islamic insights</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: currentColors.secondary }]}>
                    <FontAwesome5 name="search" size={16} color={currentColors.text + '80'} />
                    <TextInput
                        style={[styles.input, { color: currentColors.text }]}
                        placeholder="Enter a topic (e.g., Patience, Zakat)..."
                        placeholderTextColor={currentColors.text + '50'}
                        value={topic}
                        onChangeText={setTopic}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.generateButton, { backgroundColor: currentColors.tint }]}
                    onPress={() => generatePodcast(topic || 'Random Islamic Topic')}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <FontAwesome5 name="magic" size={18} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Suggested Topics Section */}
            <View style={styles.suggestedContainer}>
                <Text style={[styles.suggestedTitle, { color: currentColors.text + '80' }]}>Try a topic:</Text>
                {topicsLoading ? (
                    <ActivityIndicator color={currentColors.tint} size="small" />
                ) : (
                    <View style={styles.topicsGrid}>
                        {suggestedTopics.map((t, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.topicChip, { backgroundColor: currentColors.secondary }]}
                                onPress={() => {
                                    setTopic(t)
                                    generatePodcast(t)
                                }}
                            >
                                <Text style={[styles.topicText, { color: currentColors.text }]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <Animated.View
                entering={FadeInDown.springify()}
                style={[styles.playerCard, { backgroundColor: currentColors.secondary + '40' }]}
            >
                <View style={[styles.iconContainer, { backgroundColor: currentColors.tint + '20' }]}>
                    <FontAwesome5 name="podcast" size={40} color={currentColors.tint} />
                </View>

                <Text style={[styles.nowPlaying, { color: currentColors.text }]}>
                    {loading ? 'Generating Script...' : currentScript ? 'Now Playing' : 'Ready to Listen'}
                </Text>

                <TouchableOpacity
                    style={[styles.playButton, { backgroundColor: currentColors.tint }]}
                    onPress={togglePlayback}
                    disabled={!currentScript}
                >
                    <FontAwesome5 name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 40,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderRadius: 15,
        height: 50,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    generateButton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerCard: {
        padding: 30,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    nowPlaying: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 30,
    },
    playButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.2)',
        elevation: 8,
    },
    suggestedContainer: {
        marginBottom: 30,
    },
    suggestedTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    topicsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    topicChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    topicText: {
        fontSize: 14,
        fontWeight: '600',
    },
})
