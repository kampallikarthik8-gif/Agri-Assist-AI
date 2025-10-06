"use client";

import { useEffect, useMemo, useState } from "react";

export type UnitSystem = "metric" | "imperial";
export type RainUnit = "mm" | "in";

type Preferences = {
    unitSystem: UnitSystem;
    rainUnit?: RainUnit;
};

const DEFAULT_PREFERENCES: Preferences = {
    unitSystem: "metric",
    rainUnit: "mm",
};

const STORAGE_KEY = "agriassist.preferences.v1";

function readStoredPreferences(): Preferences {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_PREFERENCES;
        const parsed = JSON.parse(raw) as Partial<Preferences>;
        return {
            ...DEFAULT_PREFERENCES,
            ...parsed,
        };
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

function writeStoredPreferences(prefs: Preferences) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
        // ignore storage errors
    }
}

export function usePreferences() {
    const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setPreferences(readStoredPreferences());
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (!isReady) return;
        writeStoredPreferences(preferences);
    }, [preferences, isReady]);

    const setUnitSystem = (next: UnitSystem) => {
        setPreferences((prev) => ({ ...prev, unitSystem: next }));
    };
    const setRainUnit = (next: RainUnit) => {
        setPreferences((prev) => ({ ...prev, rainUnit: next }));
    };

    return useMemo(
        () => ({
            isReady,
            preferences,
            setUnitSystem,
            setRainUnit,
        }),
        [isReady, preferences]
    );
}

// The weather service currently returns imperial units (F, mph, miles).
// These helpers convert from the service's base units to the user's preferred units.
export function displayTemperatureFromFahrenheit(valueFahrenheit: number, unitSystem: UnitSystem): number {
    if (unitSystem === "metric") {
        return Math.round(((valueFahrenheit - 32) * 5) / 9);
    }
    return Math.round(valueFahrenheit);
}

export function displaySpeedFromMph(valueMph: number, unitSystem: UnitSystem): number {
    if (unitSystem === "metric") {
        return Math.round(valueMph * 1.60934);
    }
    return Math.round(valueMph);
}

export function displayDistanceFromMiles(valueMiles: number, unitSystem: UnitSystem): number {
    if (unitSystem === "metric") {
        return Math.round(valueMiles * 1.60934);
    }
    return Math.round(valueMiles);
}

export function displayRainfallMm(valueMm: number, rainUnit: RainUnit | undefined): number {
    if (rainUnit === "in") {
        return Math.round((valueMm / 25.4) * 100) / 100;
    }
    return Math.round(valueMm * 10) / 10;
}


