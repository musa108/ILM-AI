import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useLanguage } from '@/context/LanguageContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

export default function QuranTab() {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { t } = useLanguage();
    const colorScheme = useColorScheme() ?? 'light';
    const currentColors = Colors[colorScheme as keyof typeof Colors];

    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const response = await fetch('https://api.alquran.cloud/v1/surah');
                const data = await response.json();

                if (data.code === 200) {
                    setSurahs(data.data);
                } else {
                    setError('Failed to fetch Surahs');
                }
            } catch (e) {
                console.error('Error fetching Surahs:', e);
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchSurahs();
    }, []);

    const renderSurah = ({ item, index }: { item: Surah; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <Link href={`/surah/${item.number}`} asChild>
                <TouchableOpacity style={StyleSheet.flatten([styles.surahCard, { backgroundColor: currentColors.secondary }])}>
                    <View style={styles.surahHeader}>
                        <View style={StyleSheet.flatten([styles.surahNumberCircle, { backgroundColor: currentColors.tint + '20' }])}>
                            <Text style={StyleSheet.flatten([styles.surahNumberText, { color: currentColors.tint }])}>{item.number}</Text>
                        </View>
                        <View style={styles.surahNameContainer}>
                            <Text style={StyleSheet.flatten([styles.englishName, { color: currentColors.text }])}>{item.englishName}</Text>
                            <Text style={StyleSheet.flatten([styles.translationName, { color: currentColors.text + '80' }])}>{item.englishNameTranslation}</Text>
                        </View>
                        <Text style={StyleSheet.flatten([styles.arabicName, { color: currentColors.tint }])}>{item.name}</Text>
                    </View>
                    <View style={styles.surahInfo}>
                        <Text style={StyleSheet.flatten([styles.infoText, { color: currentColors.text + '80' }])}>
                            {item.revelationType === 'Meccan' ? 'Mecca' : 'Medina'} • {item.numberOfAyahs} Ayahs
                        </Text>
                        <FontAwesome5 name="chevron-right" size={14} color={currentColors.text + '50'} />
                    </View>
                </TouchableOpacity>
            </Link>
        </Animated.View>
    );

    if (loading) {
        return (
            <SafeAreaView style={StyleSheet.flatten([styles.container, styles.center, { backgroundColor: currentColors.background }])}>
                <ActivityIndicator size="large" color={currentColors.tint} />
                <Text style={StyleSheet.flatten([{ marginTop: 10, color: currentColors.text }])}>Loading Holy Quran...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={StyleSheet.flatten([styles.container, styles.center, { backgroundColor: currentColors.background }])}>
                <FontAwesome5 name="exclamation-triangle" size={40} color="#FF6B6B" style={{ marginBottom: 15 }} />
                <Text style={StyleSheet.flatten([styles.errorText, { color: currentColors.text }])}>{error}</Text>
                <TouchableOpacity style={StyleSheet.flatten([styles.retryButton, { backgroundColor: currentColors.tint }])} onPress={() => setLoading(true)}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: currentColors.background }])}>
            <Animated.View entering={FadeInUp.delay(100)} style={styles.headerContainer}>
                <Text style={StyleSheet.flatten([styles.headerTitle, { color: currentColors.text }])}>{t('quran') || 'Al-Quran'}</Text>
                <Text style={StyleSheet.flatten([styles.headerSubtitle, { color: currentColors.text + '80' }])}>Read and reflect on the Holy Quran</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)} style={StyleSheet.flatten([styles.bannerCard, { backgroundColor: currentColors.tint }])}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerSubtitle}>Last Read</Text>
                    <Text style={styles.bannerTitle}>Al-Fatihah</Text>
                    <Text style={styles.bannerAyah}>Ayah No: 1</Text>
                </View>
                <FontAwesome5 name="book-open" size={60} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
            </Animated.View>

            <FlatList
                data={surahs}
                keyExtractor={(item) => item.number.toString()}
                renderItem={renderSurah}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        padding: 20,
        paddingTop: 30,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    bannerCard: {
        marginHorizontal: 20,
        borderRadius: 25,
        padding: 25,
        marginBottom: 20,
        overflow: 'hidden',
        height: 140,
        justifyContent: 'center',
        position: 'relative',
    },
    bannerContent: {
        zIndex: 2,
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    bannerTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bannerAyah: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },
    bannerIcon: {
        position: 'absolute',
        right: -10,
        bottom: -15,
        transform: [{ rotate: '-15deg' }]
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 12,
    },
    surahCard: {
        padding: 20,
        borderRadius: 20,
    },
    surahHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    surahNumberCircle: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    surahNumberText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    surahNameContainer: {
        flex: 1,
    },
    englishName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    translationName: {
        fontSize: 13,
        fontWeight: '500',
    },
    arabicName: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'System',
    },
    surahInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 15,
    },
    infoText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    errorText: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
