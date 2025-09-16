"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function YieldEstimatorPage() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Yield Estimator</CardTitle>
					<CardDescription>Estimate crop yields based on inputs, weather, and historical data.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Provide field details to get an estimate.</p>
				</CardContent>
			</Card>
		</div>
	);
}
