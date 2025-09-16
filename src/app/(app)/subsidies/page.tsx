"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubsidiesPage() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Subsidies & Benefits Tracker</CardTitle>
					<CardDescription>Track applications, status, and payouts.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No subsidy applications yet.</p>
				</CardContent>
			</Card>
		</div>
	);
}
