import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ADHAN_URL = 'https://archive.org/download/adhan-arabb-world/adhan.mp3';
let adhanSound: Audio.Sound | null = null;

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

async function playAdhanAndVibrate() {
    try {
        if (Platform.OS === 'web') {
            if ('vibrate' in navigator) {
                navigator.vibrate([1000, 500, 1000, 500, 1000]);
            }
            return;
        }

        // Play Adhan Sound
        if (adhanSound) {
            await adhanSound.unloadAsync();
        }
        const { sound } = await Audio.Sound.createAsync(
            { uri: ADHAN_URL },
            { shouldPlay: true }
        );
        adhanSound = sound;

        // Vibrate for 10 seconds
        const vibrationInterval = setInterval(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 1000);

        // Stop after 10 seconds
        setTimeout(async () => {
            clearInterval(vibrationInterval);
        }, 10000);

    } catch (error) {
        console.log('Error in Adhan/vibration:', error);
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
    try {
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
                sound: 'default',
            });
        }

        // Add listener for when notification is tapped
        Notifications.addNotificationResponseReceivedListener(response => {
            const title = response.notification.request.content.title?.toLowerCase();
            if (title?.includes('prayer')) {
                playAdhanAndVibrate();
            }
        });

        await scheduleDailyQuote();
        await scheduleFridaySermonReminder();

        // Get location for prayer times
        let location = null;
        try {
            const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
            if (locStatus === 'granted') {
                location = await Location.getCurrentPositionAsync({});
            }
        } catch (e) {
            console.log('Error getting location for prayer times, falling back to defaults');
        }

        await schedulePrayerReminders(location?.coords);
    } catch (error) {
        console.error('Error setting up notifications:', error);
    }
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

async function schedulePrayerReminders(coords?: { latitude: number, longitude: number }) {
    // Cancel existing to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    let prayerTimes: any;

    if (coords) {
        const coordinates = new Coordinates(coords.latitude, coords.longitude);
        const params = CalculationMethod.MuslimWorldLeague();
        prayerTimes = new PrayerTimes(coordinates, new Date(), params);
    }

    const prayers = [
        { name: 'Fajr', hour: prayerTimes?.fajr.getHours() ?? 5, minute: prayerTimes?.fajr.getMinutes() ?? 0 },
        { name: 'Dhuhr', hour: prayerTimes?.dhuhr.getHours() ?? 13, minute: prayerTimes?.dhuhr.getMinutes() ?? 0 },
        { name: 'Asr', hour: prayerTimes?.asr.getHours() ?? 16, minute: prayerTimes?.asr.getMinutes() ?? 30 },
        { name: 'Maghrib', hour: prayerTimes?.maghrib.getHours() ?? 18, minute: prayerTimes?.maghrib.getMinutes() ?? 45 },
        { name: 'Isha', hour: prayerTimes?.isha.getHours() ?? 20, minute: prayerTimes?.isha.getMinutes() ?? 0 },
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
