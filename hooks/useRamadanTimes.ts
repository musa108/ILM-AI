import { CalculationMethod, Coordinates, PrayerTimes, SunnahTimes } from 'adhan';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface RamadanTimes {
    fajr: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
    suhoor: Date;
    iftar: Date;
    nextPrayer: string;
    nextPrayerTime: Date;
    loading: boolean;
    error: string | null;
}

export function useRamadanTimes() {
    const [times, setTimes] = useState<RamadanTimes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getTimes() {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                let location;

                if (status === 'granted') {
                    location = await Location.getCurrentPositionAsync({});
                } else {
                    // Fallback to Makkah if permission denied
                    location = { coords: { latitude: 21.4225, longitude: 39.8262 } };
                }

                const coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);
                const date = new Date();
                const params = CalculationMethod.MuslimWorldLeague();
                const prayerTimes = new PrayerTimes(coordinates, date, params);
                const sunnahTimes = new SunnahTimes(prayerTimes);

                const pTimes = {
                    fajr: prayerTimes.fajr,
                    dhuhr: prayerTimes.dhuhr,
                    asr: prayerTimes.asr,
                    maghrib: prayerTimes.maghrib,
                    isha: prayerTimes.isha,
                    suhoor: prayerTimes.fajr, // Suhoor ends at Fajr
                    iftar: prayerTimes.maghrib, // Iftar is at Maghrib
                };

                // Find next prayer
                const now = new Date();
                let next = "Fajr";
                let nextTime = prayerTimes.fajr;

                if (now < prayerTimes.fajr) {
                    next = "Fajr";
                    nextTime = prayerTimes.fajr;
                } else if (now < prayerTimes.dhuhr) {
                    next = "Dhuhr";
                    nextTime = prayerTimes.dhuhr;
                } else if (now < prayerTimes.asr) {
                    next = "Asr";
                    nextTime = prayerTimes.asr;
                } else if (now < prayerTimes.maghrib) {
                    next = "Maghrib";
                    nextTime = prayerTimes.maghrib;
                } else if (now < prayerTimes.isha) {
                    next = "Isha";
                    nextTime = prayerTimes.isha;
                } else {
                    // Next day's Fajr
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
                    next = "Fajr";
                    nextTime = tomorrowTimes.fajr;
                }

                setTimes({
                    ...pTimes,
                    nextPrayer: next,
                    nextPrayerTime: nextTime,
                    loading: false,
                    error: null
                });
            } catch (err) {
                setError("Failed to calculate prayer times");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        getTimes();
        const interval = setInterval(getTimes, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return { ...times, loading, error };
}
