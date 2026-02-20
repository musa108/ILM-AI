import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Countdown } from '../../components/Ramadan/Countdown';
import { DuaCard } from '../../components/Ramadan/DuaCard';
import { useRamadanTimes } from '../../hooks/useRamadanTimes';

interface DailyGoals {
    fasting: boolean;
    taraweeh: boolean;
    quranPages: number;
}

export default function RamadanDashboard() {
    const { iftar, suhoor, nextPrayer, nextPrayerTime, loading, error, ...prayerTimes } = useRamadanTimes();
    const [goals, setGoals] = useState<DailyGoals>({ fasting: false, taraweeh: false, quranPages: 0 });
    const [activeSurah, setActiveSurah] = useState<number | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const { t } = useLanguage();
    const colorScheme = useColorScheme() ?? 'light';
    const currentColors = Colors[colorScheme as keyof typeof Colors];

    useEffect(() => {
        const loadGoals = async () => {
            const today = new Date().toISOString().split('T')[0];
            const saved = await AsyncStorage.getItem(`ramadan_goals_${today}`);
            if (saved) {
                setGoals(JSON.parse(saved));
            }
        };
        loadGoals();
    }, []);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const playSurah = async (surah: { id: number; url: string }) => {
        try {
            if (activeSurah === surah.id) {
                await sound?.pauseAsync();
                setActiveSurah(null);
                return;
            }

            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: surah.url },
                { shouldPlay: true }
            );
            setSound(newSound);
            setActiveSurah(surah.id);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setActiveSurah(null);
                }
            });
        } catch (error) {
            console.error('Error playing surah:', error);
        }
    };

    const updateGoal = async (newGoals: Partial<DailyGoals>) => {
        const updated = { ...goals, ...newGoals };
        setGoals(updated);
        const today = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem(`ramadan_goals_${today}`, JSON.stringify(updated));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={currentColors.tint} />
            </View>
        );
    }

    const nextEvent = nextPrayerTime;
    const nextLabel = `Countdown to ${nextPrayer}`;

    const surahs = [
        { id: 1, name: "Al-Fatihah", reader: "Mishary Rashid Alafasy", url: "https://download.quranicaudio.com/qdc/mishari_rashid_al_afasy/murattal/1.mp3" },
        { id: 36, name: "Ya-Sin", reader: "Mishary Rashid Alafasy", url: "https://download.quranicaudio.com/qdc/mishari_rashid_al_afasy/murattal/36.mp3" },
        { id: 55, name: "Ar-Rahman", reader: "Mishary Rashid Alafasy", url: "https://download.quranicaudio.com/qdc/mishari_rashid_al_afasy/murattal/55.mp3" },
        { id: 67, name: "Al-Mulk", reader: "Mishary Rashid Alafasy", url: "https://download.quranicaudio.com/qdc/mishari_rashid_al_afasy/murattal/67.mp3" },
        { id: 18, name: "Al-Kahf", reader: "Mishary Rashid Alafasy", url: "https://download.quranicaudio.com/qdc/mishari_rashid_al_afasy/murattal/18.mp3" },
    ];

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={[currentColors.tint, currentColors.accent]} style={styles.header}>
                    <Text style={styles.headerTitle}>{t('ramadan') || 'Ramadan Hub'}</Text>
                    <Text style={styles.hijriDate}>Ramadan 1447</Text>

                    {nextEvent && <Countdown targetDate={nextEvent as Date} label={nextLabel} />}
                </LinearGradient>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Listen to Quran</Text>
                        <View style={[styles.card, { backgroundColor: currentColors.secondary }]}>
                            {surahs.map((surah) => (
                                <TouchableOpacity
                                    key={surah.id}
                                    style={styles.surahRow}
                                    onPress={() => playSurah(surah)}
                                >
                                    <View style={styles.surahInfo}>
                                        <View style={[styles.surahNumber, { backgroundColor: currentColors.tint + '20' }]}>
                                            <Text style={{ color: currentColors.tint, fontWeight: 'bold' }}>{surah.id}</Text>
                                        </View>
                                        <View>
                                            <Text style={[styles.surahName, { color: currentColors.text }]}>{surah.name}</Text>
                                            <Text style={[styles.readerName, { color: currentColors.text + '80' }]}>{surah.reader}</Text>
                                        </View>
                                    </View>
                                    <Ionicons
                                        name={activeSurah === surah.id ? "pause-circle" : "play-circle"}
                                        size={32}
                                        color={currentColors.tint}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Daily Checklist</Text>
                        <View style={[styles.card, { backgroundColor: currentColors.secondary }]}>
                            <TouchableOpacity
                                style={[styles.checkItem, goals.fasting && styles.checkItemActive]}
                                onPress={() => updateGoal({ fasting: !goals.fasting })}
                            >
                                <Ionicons name={goals.fasting ? "checkbox" : "square-outline"} size={22} color={goals.fasting ? "#00b894" : currentColors.text + '80'} />
                                <Text style={[styles.checkText, { color: currentColors.text }]}>Fasting</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.checkItem, goals.taraweeh && styles.checkItemActive]}
                                onPress={() => updateGoal({ taraweeh: !goals.taraweeh })}
                            >
                                <Ionicons name={goals.taraweeh ? "checkbox" : "square-outline"} size={22} color={goals.taraweeh ? "#00b894" : currentColors.text + '80'} />
                                <Text style={[styles.checkText, { color: currentColors.text }]}>Taraweeh</Text>
                            </TouchableOpacity>

                            <View style={styles.quranCounter}>
                                <Text style={[styles.checkText, { color: currentColors.text }]}>Quran Pages</Text>
                                <View style={styles.counterControls}>
                                    <TouchableOpacity onPress={() => updateGoal({ quranPages: Math.max(0, goals.quranPages - 1) })}>
                                        <Ionicons name="remove-circle" size={28} color={currentColors.tint} />
                                    </TouchableOpacity>
                                    <Text style={[styles.counterValue, { color: currentColors.text }]}>{goals.quranPages}</Text>
                                    <TouchableOpacity onPress={() => updateGoal({ quranPages: goals.quranPages + 1 })}>
                                        <Ionicons name="add-circle" size={28} color={currentColors.tint} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Essential Duas</Text>
                        <DuaCard
                            title="For Starting Fast (Suhoor)"
                            arabic="وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ"
                            transliteration="Wa bi-sawmi ghadinn nawaitu min shahri Ramadan"
                            translation="I intend to keep the fast for tomorrow in the month of Ramadan"
                        />
                        <DuaCard
                            title="For Breaking Fast (Iftar)"
                            arabic="اللَّهُمَّ اِنِّى لَكَ صُمْتُ وَبِكَ امنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ اَفْطَرْتُ"
                            transliteration="Allahumma inni laka sumtu, wa bika aamantu, wa 'ala rizqika aftartu"
                            translation="O Allah! I fasted for You and I break my fast with Your sustenance"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
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
    header: {
        padding: 24,
        paddingTop: 60,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    hijriDate: {
        color: '#fff',
        fontSize: 18,
        opacity: 0.9,
        marginBottom: 8,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    card: {
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    surahRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    surahInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    surahNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    surahName: {
        fontSize: 16,
        fontWeight: '600',
    },
    readerName: {
        fontSize: 12,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
    },
    checkItemActive: {
        opacity: 0.9,
    },
    checkText: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
    quranCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 16,
    },
});
