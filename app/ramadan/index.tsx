import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
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
    const router = useRouter();
    const { iftar, suhoor, nextPrayer, nextPrayerTime, loading, error } = useRamadanTimes();
    const [goals, setGoals] = useState<DailyGoals>({ fasting: false, taraweeh: false, quranPages: 0 });

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

    const updateGoal = async (newGoals: Partial<DailyGoals>) => {
        const updated = { ...goals, ...newGoals };
        setGoals(updated);
        const today = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem(`ramadan_goals_${today}`, JSON.stringify(updated));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0984e3" />
            </View>
        );
    }

    const nextEvent = nextPrayerTime;
    const nextLabel = `Countdown to ${nextPrayer}`;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={['#0984e3', '#00cec9']} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ramadan Hub</Text>
                    <Text style={styles.hijriDate}>Ramadan 1447</Text>

                    {nextEvent && <Countdown targetDate={nextEvent} label={nextLabel} />}
                </LinearGradient>

                <View style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Daily Checklist</Text>
                        <View style={styles.checklist}>
                            <TouchableOpacity
                                style={[styles.checkItem, goals.fasting && styles.checkItemActive]}
                                onPress={() => updateGoal({ fasting: !goals.fasting })}
                            >
                                <Ionicons name={goals.fasting ? "checkbox" : "square-outline"} size={24} color={goals.fasting ? "#00b894" : "#636e72"} />
                                <Text style={styles.checkText}>Fasting</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.checkItem, goals.taraweeh && styles.checkItemActive]}
                                onPress={() => updateGoal({ taraweeh: !goals.taraweeh })}
                            >
                                <Ionicons name={goals.taraweeh ? "checkbox" : "square-outline"} size={24} color={goals.taraweeh ? "#00b894" : "#636e72"} />
                                <Text style={styles.checkText}>Taraweeh</Text>
                            </TouchableOpacity>

                            <View style={styles.quranCounter}>
                                <Text style={styles.checkText}>Quran Pages</Text>
                                <View style={styles.counterControls}>
                                    <TouchableOpacity onPress={() => updateGoal({ quranPages: Math.max(0, goals.quranPages - 1) })}>
                                        <Ionicons name="remove-circle-outline" size={28} color="#0984e3" />
                                    </TouchableOpacity>
                                    <Text style={styles.counterValue}>{goals.quranPages}</Text>
                                    <TouchableOpacity onPress={() => updateGoal({ quranPages: goals.quranPages + 1 })}>
                                        <Ionicons name="add-circle-outline" size={28} color="#0984e3" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Essential Duas</Text>
                        <DuaCard
                            title="For Starting Fast (Suhoor)"
                            arabic="وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ"
                            transliteration="Wa bi-sawmi ghadinn nawaitu min shahri Ramadan"
                            translation="I intend to keep the fast for tomorrow in the month of Ramadan"
                        />
                        <DuaCard
                            title="For Breaking Fast (Iftar)"
                            arabic="اللَّهُمَّ اِنِّى لَكَ صُمْتُ وَبِكَ امنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ اَفْطَرْتُ"
                            transliteration="Allahumma inni laka sumtu, wa bika aamantu, [wa 'alayka tawakkaltu], wa 'ala rizqika aftartu"
                            translation="O Allah! I fasted for You and I believe in You [and I put my trust in You] and I break my fast with Your sustenance"
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
        backgroundColor: '#f5f6fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        marginBottom: 20,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    hijriDate: {
        color: '#fff',
        fontSize: 16,
        opacity: 0.9,
        marginBottom: 10,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 15,
    },
    checklist: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f2f6',
    },
    checkItemActive: {
        opacity: 0.8,
    },
    checkText: {
        fontSize: 16,
        color: '#2d3436',
        marginLeft: 12,
    },
    quranCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 15,
        color: '#0984e3',
    },
});
