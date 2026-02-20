import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DuaCardProps {
    title: string;
    arabic: string;
    transliteration: string;
    translation: string;
}

export function DuaCard({ title, arabic, transliteration, translation }: DuaCardProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.arabic}>{arabic}</Text>
            <Text style={styles.transliteration}>{transliteration}</Text>
            <Text style={styles.translation}>{translation}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 10,
    },
    arabic: {
        fontSize: 24,
        textAlign: 'right',
        color: '#0984e3',
        lineHeight: 40,
        marginBottom: 15,
        fontFamily: 'System', // Fallback to system font if custom font not provided
    },
    transliteration: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#636e72',
        marginBottom: 10,
    },
    translation: {
        fontSize: 15,
        color: '#2d3436',
        lineHeight: 22,
    },
});
