"use client";

import { useEffect, useState } from "react";
import { 
	getFirebaseApp, 
	getFirebaseAnalytics,
	getFirebaseAuth,
	getFirestoreDb,
	getFirebaseStorage,
	getFirebaseFunctions,
	getFirebaseRemoteConfig,
	getFirebasePerformance,
	getFirebaseMessaging,
	getFCMToken,
	initializeRemoteConfig
} from "@/lib/firebase";

interface ApiStatus {
	name: string;
	status: "loading" | "success" | "error";
	message: string;
}

export default function FirebaseDebugPage() {
	const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);

	const updateStatus = (name: string, status: "loading" | "success" | "error", message: string) => {
		setApiStatuses(prev => {
			const existing = prev.find(item => item.name === name);
			if (existing) {
				existing.status = status;
				existing.message = message;
				return [...prev];
			}
			return [...prev, { name, status, message }];
		});
	};

	useEffect(() => {
		const testFirebaseAPIs = async () => {
			// Test Firebase App
			try {
				const app = getFirebaseApp();
				const options = app.options || {};
				updateStatus("Firebase App", "success", `Project: ${options.projectId ?? "unknown"}`);
			} catch (err) {
				updateStatus("Firebase App", "error", `Failed: ${(err as Error).message}`);
			}

			// Test Analytics
			try {
				updateStatus("Analytics", "loading", "Initializing...");
				const analytics = await getFirebaseAnalytics();
				updateStatus("Analytics", "success", analytics ? "Initialized" : "Not supported");
			} catch (err) {
				updateStatus("Analytics", "error", `Failed: ${(err as Error).message}`);
			}

			// Test Auth
			try {
				const auth = getFirebaseAuth();
				updateStatus("Authentication", "success", `Auth instance created`);
			} catch (err) {
				updateStatus("Authentication", "error", `Failed: ${(err as Error).message}`);
			}

			// Test Firestore
			try {
				const db = getFirestoreDb();
				updateStatus("Firestore", "success", `Database instance created`);
			} catch (err) {
				updateStatus("Firestore", "error", `Failed: ${(err as Error).message}`);
			}

			// Test Storage
			try {
				const storage = getFirebaseStorage();
				updateStatus("Storage", "success", `Storage instance created`);
			} catch (err) {
				updateStatus("Storage", "error", `Failed: ${(err as Error).message}`);
			}

			// Test Functions
			try {
				const functions = getFirebaseFunctions();
				updateStatus("Functions", "success", `Functions instance created`);
			} catch (err) {
				updateStatus("Functions", "error", `Failed: ${(err as Error).message}`);
			}

			// Test Remote Config
			try {
				updateStatus("Remote Config", "loading", "Initializing...");
				const remoteConfig = getFirebaseRemoteConfig();
				await initializeRemoteConfig();
				updateStatus("Remote Config", "success", `Config fetched and activated`);
			} catch (err) {
				updateStatus("Remote Config", "error", `Failed: ${(err as Error).message}`);
			}

			// Test Performance
			try {
				const performance = getFirebasePerformance();
				updateStatus("Performance", "success", performance ? "Initialized" : "Not available");
			} catch (err) {
				updateStatus("Performance", "error", `Failed: ${(err as Error).message}`);
			}

			// Test Messaging
			try {
				updateStatus("Messaging", "loading", "Initializing...");
				const messaging = getFirebaseMessaging();
				if (messaging) {
					const token = await getFCMToken();
					updateStatus("Messaging", "success", token ? `Token: ${token.substring(0, 20)}...` : "No token available");
				} else {
					updateStatus("Messaging", "success", "Not supported in this environment");
				}
			} catch (err) {
				updateStatus("Messaging", "error", `Failed: ${(err as Error).message}`);
			}
		};

		testFirebaseAPIs();
	}, []);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "success": return "text-green-600";
			case "error": return "text-red-600";
			case "loading": return "text-yellow-600";
			default: return "text-gray-600";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "success": return "✅";
			case "error": return "❌";
			case "loading": return "⏳";
			default: return "ℹ️";
		}
	};

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Firebase APIs Status</h1>
			
			<div className="grid gap-4 md:grid-cols-2">
				{apiStatuses.map((api, index) => (
					<div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
						<div className="flex items-center gap-3">
							<span className="text-lg">{getStatusIcon(api.status)}</span>
							<div>
								<h3 className="font-semibold text-lg">{api.name}</h3>
								<p className={`text-sm ${getStatusColor(api.status)}`}>
									{api.message}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-8 p-4 bg-blue-50 rounded-lg">
				<h2 className="font-semibold mb-2">Environment Variables Required:</h2>
				<div className="text-sm text-gray-700 space-y-1">
					<p>• NEXT_PUBLIC_FIREBASE_API_KEY</p>
					<p>• NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</p>
					<p>• NEXT_PUBLIC_FIREBASE_PROJECT_ID</p>
					<p>• NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</p>
					<p>• NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</p>
					<p>• NEXT_PUBLIC_FIREBASE_APP_ID</p>
					<p>• NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)</p>
					<p>• NEXT_PUBLIC_FIREBASE_VAPID_KEY (for messaging)</p>
				</div>
			</div>
		</div>
	);
}
