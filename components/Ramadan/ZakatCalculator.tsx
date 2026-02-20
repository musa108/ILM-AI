import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function ZakatCalculator() {
    const colorScheme = useColorScheme() ?? 'light';
    const currentColors = Colors[colorScheme as keyof typeof Colors];
    const [assets, setAssets] = useState('');
    const [liabilities, setLiabilities] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const calculateZakat = () => {
        const totalAssets = parseFloat(assets) || 0;
        const totalLiabilities = parseFloat(liabilities) || 0;
        const netWealth = totalAssets - totalLiabilities;

        // Simple Zakat calculation (2.5% of net wealth if above Nisab)
        // Note: For a real app, Nisab value should be fetched/updated.
        const nisabThreshold = 5000; // Placeholder value in common currency

        if (netWealth >= nisabThreshold) {
            setResult(netWealth * 0.025);
        } else {
            setResult(0);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentColors.secondary }]}>
            <Text style={[styles.title, { color: currentColors.text }]}>Zakat Calculator</Text>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: currentColors.text + 'CC' }]}>Total Assets (Cash, Gold, Silver)</Text>
                <TextInput
                    style={[styles.input, { color: currentColors.text, borderColor: currentColors.tint + '40' }]}
                    placeholder="Enter amount"
                    placeholderTextColor={currentColors.text + '60'}
                    keyboardType="numeric"
                    value={assets}
                    onChangeText={setAssets}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: currentColors.text + 'CC' }]}>Total Liabilities (Debts, Expenses)</Text>
                <TextInput
                    style={[styles.input, { color: currentColors.text, borderColor: currentColors.tint + '40' }]}
                    placeholder="Enter amount"
                    placeholderTextColor={currentColors.text + '60'}
                    keyboardType="numeric"
                    value={liabilities}
                    onChangeText={setLiabilities}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: currentColors.tint }]}
                onPress={calculateZakat}
            >
                <Text style={styles.buttonText}>Calculate Zakat</Text>
            </TouchableOpacity>

            {result !== null && (
                <View style={[styles.resultContainer, { backgroundColor: currentColors.tint + '10' }]}>
                    <Ionicons name="cash-outline" size={24} color={currentColors.tint} />
                    <View style={styles.resultTextContainer}>
                        <Text style={[styles.resultLabel, { color: currentColors.text }]}>
                            {result > 0 ? 'Your Zakat Due:' : 'Net wealth below Nisab'}
                        </Text>
                        {result > 0 && (
                            <Text style={[styles.resultValue, { color: currentColors.tint }]}>
                                {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    button: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    resultContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
    },
    resultTextContainer: {
        marginLeft: 12,
    },
    resultLabel: {
        fontSize: 14,
        opacity: 0.8,
    },
    resultValue: {
        fontSize: 24,
        fontWeight: '800',
    },
});
