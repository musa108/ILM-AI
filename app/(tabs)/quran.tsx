import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useLanguage } from '@/context/LanguageContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

    const renderSurah = ({ item }: { item: Surah }) => (
        <Link href={`/surah/${item.number}`} asChild>
            <TouchableOpacity style={StyleSheet.flatten([])}>
                <View style={styles.surahHeader}>
                    <View style={StyleSheet.flatten([])}>
                        <Text style={StyleSheet.flatten([])}>{item.number}</Text>
                    </View>
                    <View style={styles.surahNameContainer}>
                        <Text style={StyleSheet.flatten([])}>{item.englishName}</Text>
                        <Text style={StyleSheet.flatten([])}>{item.englishNameTranslation}</Text>
                    </View>
                    <Text style={StyleSheet.flatten([])}>{item.name}</Text>
                </View>
                <View style={styles.surahInfo}>
                    <Text style={StyleSheet.flatten([])}>
                        {item.revelationType === 'Meccan' ? 'Mecca' : 'Medina'} • {item.numberOfAyahs} Ayahs
                    </Text>
                    <FontAwesome5 name="chevron-right" size={14} color={currentColors.text + '50'} />
                </View>
            </TouchableOpacity>
        </Link>
    );

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
                <TouchableOpacity style={StyleSheet.flatten([])} onPress={() => setLoading(true)}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={StyleSheet.flatten([])}>
            <View style={styles.header}>
                <Text style={StyleSheet.flatten([])}>{t('quran') || 'Al-Quran'}</Text>
                <Text style={StyleSheet.flatten([])}>Read and reflect on the Holy Quran</Text>
            </View>

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
    header: {
        padding: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    listContainer: {
        padding: 20,
        gap: 12,
    },
    surahCard: {
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    surahHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    surahNumberCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    surahNumberText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    surahNameContainer: {
        flex: 1,
    },
    englishName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    translationName: {
        fontSize: 13,
    },
    arabicName: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'System', // Could use a specific Arabic font if available
    },
    surahInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
    },
    infoText: {
        fontSize: 13,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        marginBottom: 16,
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
