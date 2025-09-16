"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Notifications Center</CardTitle>
					<CardDescription>Weather alerts, pest risks, market updates, and app messages.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No notifications yet.</p>
				</CardContent>
			</Card>
		</div>
	);
}
