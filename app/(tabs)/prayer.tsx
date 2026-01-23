import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { QURAN_VERSES } from '@/data/quranVerses'
import { FontAwesome5 } from '@expo/vector-icons'
import { Prayer as AdhanPrayer, CalculationMethod, Coordinates, PrayerTimes } from 'adhan'
import { LinearGradient } from 'expo-linear-gradient'
import * as Location from 'expo-location'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function PrayerScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
    const [nextPrayer, setNextPrayer] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [randomVerse, setRandomVerse] = useState(QURAN_VERSES[0])

    const colorScheme = useColorScheme() ?? 'light'
    const currentColors = Colors[colorScheme as keyof typeof Colors]

    useEffect(() => {
        (async () => {
            await fetchLocationAndPrayers()
            setRandomVerse(QURAN_VERSES[Math.floor(Math.random() * QURAN_VERSES.length)])
        })()
    }, [])

    const fetchLocationAndPrayers = async () => {
        setLoading(true)
        try {
            let { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied')
                setLoading(false)
                return
            }

            let location = await Location.getCurrentPositionAsync({})
            setLocation(location)

            const coordinates = new Coordinates(location.coords.latitude, location.coords.longitude)
            const date = new Date()
            const params = CalculationMethod.MoonsightingCommittee()
            const prayerTimes = new PrayerTimes(coordinates, date, params)
            setPrayerTimes(prayerTimes)

            const next = prayerTimes.nextPrayer()
            const nextName = next === AdhanPrayer.Fajr ? 'Fajr' :
                next === AdhanPrayer.Sunrise ? 'Sunrise' :
                    next === AdhanPrayer.Dhuhr ? 'Dhuhr' :
                        next === AdhanPrayer.Asr ? 'Asr' :
                            next === AdhanPrayer.Maghrib ? 'Maghrib' :
                                next === AdhanPrayer.Isha ? 'Isha' : 'None'

            setNextPrayer(nextName)

        } catch (error) {
            setErrorMsg('Error fetching location or prayer times')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const onRefresh = React.useCallback(() => {
        setRefreshing(true)
        fetchLocationAndPrayers()
        setRandomVerse(QURAN_VERSES[Math.floor(Math.random() * QURAN_VERSES.length)])
    }, [])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: currentColors.background }]}>
                <ActivityIndicator size="large" color={currentColors.tint} />
                <Text style={{ marginTop: 10, color: currentColors.text }}>Loading Prayer Times...</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.tint} />}
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: currentColors.text }]}>Prayer Times</Text>
                    <Text style={[styles.headerSubtitle, { color: currentColors.text + '80' }]}>
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                {errorMsg ? (
                    <View style={styles.errorContainer}>
                        <FontAwesome5 name="exclamation-triangle" size={40} color="#FF6B6B" />
                        <Text style={[styles.errorText, { color: currentColors.text }]}>{errorMsg}</Text>
                    </View>
                ) : prayerTimes ? (
                    <>
                        <Animated.View entering={FadeInDown.delay(100)} style={[styles.card, { backgroundColor: currentColors.tint }]}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.1)', 'transparent']}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={styles.nextPrayerContainer}>
                                <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
                                <Text style={styles.nextPrayerName}>{nextPrayer !== 'None' ? nextPrayer : 'Fajr (Is Tomorrow)'}</Text>
                                {/* Simple logic for next time display could be added here */}
                            </View>
                            <FontAwesome5 name="mosque" size={60} color="rgba(255,255,255,0.2)" style={styles.cardIcon} />
                        </Animated.View>

                        <View style={styles.timesContainer}>
                            {[
                                { name: 'Fajr', time: prayerTimes.fajr, icon: 'cloud-sun' },
                                { name: 'Sunrise', time: prayerTimes.sunrise, icon: 'sun' },
                                { name: 'Dhuhr', time: prayerTimes.dhuhr, icon: 'sun' },
                                { name: 'Asr', time: prayerTimes.asr, icon: 'cloud-sun' },
                                { name: 'Maghrib', time: prayerTimes.maghrib, icon: 'moon' },
                                { name: 'Isha', time: prayerTimes.isha, icon: 'moon' },
                            ].map((prayer, index) => (
                                <Animated.View
                                    key={prayer.name}
                                    entering={FadeInDown.delay(200 + index * 100)}
                                    style={[
                                        styles.timeRow,
                                        {
                                            backgroundColor: currentColors.secondary + '40',
                                            borderColor: nextPrayer === prayer.name ? currentColors.tint : 'transparent',
                                            borderWidth: nextPrayer === prayer.name ? 2 : 0
                                        }
                                    ]}
                                >
                                    <View style={styles.timeLabelRef}>
                                        <FontAwesome5 name={prayer.icon} size={16} color={currentColors.text + '80'} style={{ width: 25 }} />
                                        <Text style={[styles.timeLabel, { color: currentColors.text }]}>{prayer.name}</Text>
                                    </View>
                                    <Text style={[styles.timeValue, { color: currentColors.text }]}>{formatTime(prayer.time)}</Text>
                                </Animated.View>
                            ))}
                        </View>
                    </>
                ) : null}

                <Animated.View entering={FadeInUp.delay(600)} style={[styles.verseContainer, { backgroundColor: currentColors.secondary + '20' }]}>
                    <Text style={[styles.sectionTitle, { color: currentColors.tint }]}>Verse of the Moment</Text>
                    <Text style={[styles.arabicText, { color: currentColors.text }]}>{randomVerse.arabic}</Text>
                    <Text style={[styles.englishText, { color: currentColors.text }]}>"{randomVerse.english}"</Text>
                    <Text style={[styles.referenceText, { color: currentColors.text + '60' }]}>- {randomVerse.reference}</Text>
                </Animated.View>

            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 16,
        marginTop: 5,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
    },
    card: {
        borderRadius: 25,
        padding: 25,
        marginBottom: 30,
        overflow: 'hidden',
        height: 150,
        justifyContent: 'center',
        position: 'relative',
    },
    nextPrayerContainer: {
        zIndex: 2,
    },
    nextPrayerLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    nextPrayerName: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
    },
    cardIcon: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        transform: [{ rotate: '-15deg' }]
    },
    timesContainer: {
        gap: 12,
        marginBottom: 30,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    timeLabelRef: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 10,
    },
    timeValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    verseContainer: {
        padding: 25,
        borderRadius: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    arabicText: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 15,
        fontFamily: 'System', // Or a custom Arabic font if available
        lineHeight: 40,
    },
    englishText: {
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 24,
    },
    referenceText: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '600',
    },
})
