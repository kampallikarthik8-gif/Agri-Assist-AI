import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";
import { getRemoteConfig, RemoteConfig, fetchAndActivate } from "firebase/remote-config";
import { getPerformance, trace } from "firebase/performance";
import { getMessaging, Messaging, getToken, onMessage } from "firebase/messaging";
import { initializeAppCheck, AppCheck } from "firebase/app-check";

let cachedApp: FirebaseApp | undefined;
let cachedAuth: Auth | undefined;
let cachedDb: Firestore | undefined;
let cachedStorage: FirebaseStorage | undefined;
let cachedAnalytics: Analytics | undefined;
let cachedFunctions: Functions | undefined;
let cachedRemoteConfig: RemoteConfig | undefined;
let cachedPerformance: any | undefined;
let cachedMessaging: Messaging | undefined;
let cachedAppCheck: AppCheck | undefined;

function getFirebaseConfig() {
	return {
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
		measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
	} as const;
}

export function getFirebaseApp(): FirebaseApp {
	if (typeof window === "undefined") {
		throw new Error("getFirebaseApp() must be called in the browser.");
	}
	if (cachedApp) return cachedApp;
	cachedApp = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
	return cachedApp;
}

export function getFirebaseAuth(): Auth {
	if (!cachedAuth) {
		cachedAuth = getAuth(getFirebaseApp());
	}
	return cachedAuth;
}

export function getFirestoreDb(): Firestore {
	if (!cachedDb) {
		cachedDb = getFirestore(getFirebaseApp());
	}
	return cachedDb;
}

export function getFirebaseStorage(): FirebaseStorage {
	if (!cachedStorage) {
		cachedStorage = getStorage(getFirebaseApp());
	}
	return cachedStorage;
}

export async function getFirebaseAnalytics(): Promise<Analytics | undefined> {
	if (cachedAnalytics) return cachedAnalytics;
	if (typeof window === "undefined") return undefined;
	const supported = await isAnalyticsSupported();
	if (!supported) return undefined;
	cachedAnalytics = getAnalytics(getFirebaseApp());
	return cachedAnalytics;
}

export function getFirebaseFunctions(): Functions {
	if (!cachedFunctions) {
		cachedFunctions = getFunctions(getFirebaseApp());
		// Connect to emulator in development
		if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR) {
			connectFunctionsEmulator(cachedFunctions, "localhost", 5001);
		}
	}
	return cachedFunctions;
}

export function getFirebaseRemoteConfig(): RemoteConfig {
	if (!cachedRemoteConfig) {
		cachedRemoteConfig = getRemoteConfig(getFirebaseApp());
		// Set default values and fetch settings
		cachedRemoteConfig.settings = {
			minimumFetchIntervalMillis: 3600000, // 1 hour
			fetchTimeoutMillis: 60000, // 1 minute
		};
	}
	return cachedRemoteConfig;
}

export async function initializeRemoteConfig(): Promise<void> {
	const remoteConfig = getFirebaseRemoteConfig();
	await fetchAndActivate(remoteConfig);
}

export function getFirebasePerformance(): any | undefined {
	if (typeof window === "undefined") return undefined;
	if (!cachedPerformance) {
		cachedPerformance = getPerformance(getFirebaseApp());
	}
	return cachedPerformance;
}

export function createPerformanceTrace(name: string) {
	const perf = getFirebasePerformance();
	return perf ? trace(perf, name) : null;
}

export function getFirebaseMessaging(): Messaging | undefined {
	if (typeof window === "undefined") return undefined;
	if (!cachedMessaging) {
		cachedMessaging = getMessaging(getFirebaseApp());
	}
	return cachedMessaging;
}

export async function getFCMToken(): Promise<string | null> {
	const messaging = getFirebaseMessaging();
	if (!messaging) return null;
	
	try {
		return await getToken(messaging, {
			vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
		});
	} catch (error) {
		console.error("Failed to get FCM token:", error);
		return null;
	}
}

export function onFCMMessage(callback: (payload: any) => void) {
	const messaging = getFirebaseMessaging();
	if (!messaging) return () => {};
	
	return onMessage(messaging, callback);
}

export function getFirebaseAppCheck(): AppCheck | undefined {
	if (typeof window === "undefined") return undefined;
	if (!cachedAppCheck) {
		// Note: You'll need to configure a proper provider for App Check
		// For now, we'll skip initialization to avoid errors
		console.warn("App Check requires proper provider configuration");
		return undefined;
	}
	return cachedAppCheck;
}
