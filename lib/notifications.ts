import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ADHAN_URL = 'https://archive.org/download/adhan-arabb-world/adhan.mp3';

if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
            // Check if it's a prayer notification
            const isPrayer = notification.request.content.title?.toLowerCase().includes('prayer');
            if (isPrayer) {
                playAdhanAndVibrate();
            }
            return {
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            };
        },
    });
}

// Vibration only for now since expo-audio is removed.
async function playAdhanAndVibrate() {
    try {
        // Vibrate for 10 seconds
        const vibrationInterval = setInterval(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 1000);

        // Stop after 10 seconds
        setTimeout(async () => {
            clearInterval(vibrationInterval);
        }, 10000);

    } catch (error) {
        console.log('Error in vibration:', error);
    }
}

const QUOTES = [
    "Indeed, with hardship [will be] ease. (94:6)",
    "And whoever relies upon Allah - then He is sufficient for him. (65:3)",
    "Call upon Me; I will respond to you. (40:60)",
    "The best among you is the one who does not harm others with his tongue and hands. (Hadith)",
    "Do not lose hope, nor be sad. (3:139)",
    "Allah does not burden a soul beyond that it can bear. (2:286)",
    "Speak good or remain silent. (Hadith)"
];

export async function setupNotifications() {
    if (Platform.OS === 'web') return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permission not granted for notifications');
        return;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('prayer-times', {
            name: 'Prayer Times',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default', // Custom sound files for Android require integration in native assets
        });
    }

    // Add listener for when notification is tapped (Background case)
    Notifications.addNotificationResponseReceivedListener(response => {
        const title = response.notification.request.content.title?.toLowerCase();
        if (title?.includes('prayer')) {
            playAdhanAndVibrate();
        }
    });

    await scheduleDailyQuote();
    await scheduleFridaySermonReminder();
    await schedulePrayerReminders();
}

async function scheduleDailyQuote() {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Daily Wisdom",
            body: randomQuote,
        },
        trigger: {
            type: 'calendar',
            hour: 9,
            minute: 0,
            repeats: true,
        } as any,
    });
}

async function scheduleFridaySermonReminder() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Jumu'ah Reminder",
            body: "Don't forget to listen to the Friday Reminder podcast!",
        },
        trigger: {
            type: 'calendar',
            weekday: 6, // Friday
            hour: 10,
            minute: 0,
            repeats: true,
        } as any
    });
}

async function schedulePrayerReminders() {
    // Cancel existing to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prayers = [
        { name: 'Fajr', hour: 5, minute: 0 },
        { name: 'Dhuhr', hour: 13, minute: 0 },
        { name: 'Asr', hour: 16, minute: 30 },
        { name: 'Maghrib', hour: 18, minute: 45 },
        { name: 'Isha', hour: 20, minute: 0 },
    ]

    for (const prayer of prayers) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${prayer.name} Prayer`,
                body: "It's time for prayer. Come to success!",
                data: { type: 'prayer' },
            },
            trigger: {
                type: 'calendar',
                hour: prayer.hour,
                minute: prayer.minute,
                repeats: true,
            } as any,
        });
    }
}
