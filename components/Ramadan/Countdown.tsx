import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CountdownProps {
    targetDate: Date;
    label: string;
}

export function Countdown({ targetDate, label }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            }
        };

        const timer = setInterval(calculateTime, 1000);
        calculateTime();

        return () => clearInterval(timer);
    }, [targetDate]);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.timerContainer}>
                <View style={styles.timeBlock}>
                    <Text style={styles.timeText}>{formatNumber(timeLeft.hours)}</Text>
                    <Text style={styles.timeLabel}>HRS</Text>
                </View>
                <Text style={styles.separator}>:</Text>
                <View style={styles.timeBlock}>
                    <Text style={styles.timeText}>{formatNumber(timeLeft.minutes)}</Text>
                    <Text style={styles.timeLabel}>MIN</Text>
                </View>
                <Text style={styles.separator}>:</Text>
                <View style={styles.timeBlock}>
                    <Text style={styles.timeText}>{formatNumber(timeLeft.seconds)}</Text>
                    <Text style={styles.timeLabel}>SEC</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginVertical: 10,
    },
    label: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
        opacity: 0.8,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeBlock: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    timeText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    timeLabel: {
        color: '#fff',
        fontSize: 10,
        marginTop: 4,
        opacity: 0.6,
    },
    separator: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
