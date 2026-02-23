import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    translation: string;
}

interface SurahDetail {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: Ayah[];
}

export default function SurahScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const currentColors = Colors[colorScheme as keyof typeof Colors];

    const [surah, setSurah] = useState<SurahDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSurah = async () => {
            try {
                // Fetch both Arabic (quran-uthmani) and English (en.asad) editions
                const response = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,en.asad`);
                const data = await response.json();

                if (data.code === 200 && data.data.length === 2) {
                    const arabicData = data.data[0];
                    const englishData = data.data[1];

                    // Merge ayahs
                    const mergedAyahs = arabicData.ayahs.map((ayah: any, index: number) => ({
                        number: ayah.number,
                        text: ayah.text,
                        numberInSurah: ayah.numberInSurah,
                        translation: englishData.ayahs[index].text,
                    }));

                    setSurah({
                        number: arabicData.number,
                        name: arabicData.name,
                        englishName: arabicData.englishName,
                        englishNameTranslation: arabicData.englishNameTranslation,
                        revelationType: arabicData.revelationType,
                        numberOfAyahs: arabicData.numberOfAyahs,
                        ayahs: mergedAyahs,
                    });
                } else {
                    setError('Failed to load Surah data');
                }
            } catch (e) {
                console.error("Error fetching Surah details:", e);
                setError('Network error. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSurah();
        }
    }, [id]);

    const renderAyah = ({ item, index }: { item: Ayah, index: number }) => {
        let arabicText = item.text;
        const bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

        if (item.numberInSurah === 1 && surah?.number !== 1 && arabicText.startsWith(bismillah)) {
            arabicText = arabicText.replace(bismillah, '').trim();
        }

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 50).springify()}
                style={StyleSheet.flatten([styles.ayahCard, { backgroundColor: currentColors.secondary + '15', borderLeftColor: currentColors.tint }])}
            >
                <View style={styles.ayahHeader}>
                    <View style={StyleSheet.flatten([styles.ayahNumberBadge, { backgroundColor: currentColors.tint }])}>
                        <Text style={styles.ayahNumberText}>{item.numberInSurah}</Text>
                    </View>
                    <View style={styles.ayahActions}>
                        <TouchableOpacity style={styles.actionIcon}>
                            <FontAwesome5 name="copy" size={14} color={currentColors.text + '60'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionIcon}>
                            <FontAwesome5 name="share-alt" size={14} color={currentColors.text + '60'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={StyleSheet.flatten([styles.arabicText, { color: currentColors.text }])} >
                    {arabicText}
                </Text>

                <Text style={StyleSheet.flatten([styles.translationText, { color: currentColors.text + '90' }])}>
                    {item.translation}
                </Text>
            </Animated.View>
        );
    };

    const renderHeader = () => {
        if (!surah) return null;

        return (
            <Animated.View entering={FadeInUp.delay(200)} style={StyleSheet.flatten([styles.surahBanner, { backgroundColor: currentColors.tint }])}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                />
                <Text style={styles.surahNameArabicLarge}>{surah.name}</Text>
                <Text style={styles.surahNameEnglishLarge}>{surah.englishName}</Text>
                <Text style={styles.surahTranslationLarge}>{surah.englishNameTranslation}</Text>

                <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>
                        {surah.revelationType === 'Meccan' ? 'Mecca' : 'Medina'} • {surah.numberOfAyahs} Ayahs
                    </Text>
                </View>

                {surah.number !== 1 && surah.number !== 9 && (
                    <View style={styles.bismillahContainer}>
                        <Text style={StyleSheet.flatten([styles.bismillahText, { color: '#fff' }])} >
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </Text>
                    </View>
                )}
            </Animated.View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={StyleSheet.flatten([styles.container, styles.center, { backgroundColor: currentColors.background }])}>
                <ActivityIndicator size="large" color={currentColors.tint} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={StyleSheet.flatten([styles.container, styles.center, { backgroundColor: currentColors.background }])}>
                <FontAwesome5 name="exclamation-circle" size={50} color="#ff3b30" style={{ marginBottom: 20 }} />
                <Text style={StyleSheet.flatten([styles.errorText, { color: currentColors.text }])}>{error}</Text>
                <TouchableOpacity style={StyleSheet.flatten([styles.retryButton, { backgroundColor: currentColors.tint }])} onPress={() => router.back()}>
                    <Text style={styles.retryText}>Return to Quran</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: currentColors.background }])}>
            <View style={StyleSheet.flatten([styles.topNav, { backgroundColor: currentColors.background }])}>
                <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
                    <FontAwesome5 name="arrow-left" size={18} color={currentColors.text} />
                </TouchableOpacity>
                <Text style={StyleSheet.flatten([styles.navTitle, { color: currentColors.text }])}>
                    {surah?.englishName}
                </Text>
                <TouchableOpacity style={styles.navButton}>
                    <FontAwesome5 name="ellipsis-v" size={18} color={currentColors.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={surah?.ayahs}
                keyExtractor={(item) => item.number.toString()}
                renderItem={renderAyah}
                ListHeaderComponent={renderHeader}
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
    topNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    navButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    navTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    surahBanner: {
        margin: 20,
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        overflow: 'hidden',
    },
    surahNameArabicLarge: {
        fontSize: 48,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    surahNameEnglishLarge: {
        fontSize: 26,
        color: '#fff',
        fontWeight: 'bold',
    },
    surahTranslationLarge: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 20,
    },
    metaBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
    },
    metaBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    bismillahContainer: {
        marginTop: 25,
    },
    bismillahText: {
        fontSize: 32,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 40,
    },
    ayahCard: {
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 20,
        borderRadius: 20,
        borderLeftWidth: 4,
    },
    ayahHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    ayahNumberBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ayahNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    ayahActions: {
        flexDirection: 'row',
    },
    actionIcon: {
        marginLeft: 15,
        padding: 5,
    },
    arabicText: {
        fontSize: 28,
        lineHeight: 50,
        textAlign: 'right',
        marginBottom: 15,
        fontFamily: 'System',
    },
    translationText: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'left',
    },
    errorText: {
        fontSize: 18,
        marginBottom: 25,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    retryButton: {
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 15,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
