import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

    const renderAyah = ({ item }: { item: Ayah }) => {
        // Remove Bismillah from the first verse of every Surah except Surah Al-Fatihah, 
        // as AlQuran Cloud often includes it in the first verse text.
        let arabicText = item.text;
        const bismillah = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

        if (item.numberInSurah === 1 && surah?.number !== 1 && arabicText.startsWith(bismillah)) {
            arabicText = arabicText.replace(bismillah, '').trim();
        }

        return (
            <View style={StyleSheet.flatten([])}>
                <View style={StyleSheet.flatten([])}>
                    <Text style={StyleSheet.flatten([])}>{item.numberInSurah}</Text>
                    <View style={styles.ayahActions}>
                        {/* Placeholder for future actions like play audio for specific ayah */}
                        <FontAwesome5 name="book-reader" size={14} color={currentColors.tint} />
                    </View>
                </View>

                <Text style={StyleSheet.flatten([])} >
                    {arabicText}
                </Text>

                <Text style={StyleSheet.flatten([])}>
                    {item.translation}
                </Text>
            </View>
        );
    };

    const renderHeader = () => {
        if (!surah) return null;

        return (
            <View style={styles.headerContent}>
                <Text style={StyleSheet.flatten([])}>{surah.name}</Text>
                <Text style={StyleSheet.flatten([])}>{surah.englishName}</Text>
                <Text style={StyleSheet.flatten([])}>{surah.englishNameTranslation}</Text>

                <View style={styles.surahMeta}>
                    <Text style={StyleSheet.flatten([])}>
                        {surah.revelationType === 'Meccan' ? 'Mecca' : 'Medina'} • {surah.numberOfAyahs} Ayahs
                    </Text>
                </View>

                {surah.number !== 1 && surah.number !== 9 && (
                    <Text style={StyleSheet.flatten([])} >
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </Text>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={StyleSheet.flatten([])}>
                <ActivityIndicator size="large" color={currentColors.tint} />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={StyleSheet.flatten([])}>
                <Text style={StyleSheet.flatten([])}>{error}</Text>
                <TouchableOpacity style={StyleSheet.flatten([])} onPress={() => router.back()}>
                    <Text style={styles.retryText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={StyleSheet.flatten([])}>
            <View style={StyleSheet.flatten([])}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome5 name="arrow-left" size={20} color={currentColors.text} />
                </TouchableOpacity>
                <Text style={StyleSheet.flatten([])}>
                    {surah?.englishName || 'Loading...'}
                </Text>
                <View style={{ width: 40 }} /> {/* Spacer to center title */}
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
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: {
        padding: 5,
    },
    topBarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerContent: {
        alignItems: 'center',
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        marginBottom: 20,
    },
    surahNameArabic: {
        fontSize: 42,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    surahNameEnglish: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    surahTranslation: {
        fontSize: 14,
        marginBottom: 15,
    },
    surahMeta: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 20,
        marginBottom: 25,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    bismillah: {
        fontSize: 28,
        marginTop: 10,
    },
    listContainer: {
        paddingBottom: 40,
    },
    ayahContainer: {
        paddingHorizontal: 20,
        paddingVertical: 25,
        borderBottomWidth: 1,
    },
    ayahHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 20,
    },
    ayahNumber: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    ayahActions: {
        flexDirection: 'row',
    },
    arabicText: {
        fontSize: 28,
        lineHeight: 45,
        textAlign: 'right',
        marginBottom: 20,
        fontFamily: 'System', // Would be amazing with a dedicated Quranic font
    },
    translationText: {
        fontSize: 16,
        lineHeight: 26,
        textAlign: 'left',
    },
    errorText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
