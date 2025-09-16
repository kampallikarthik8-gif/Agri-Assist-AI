"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TasksPage() {
	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Farm Tasks Planner</CardTitle>
					<CardDescription>Plan and track sowing, spraying, irrigation, and harvest tasks.</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No tasks scheduled yet.</p>
				</CardContent>
			</Card>
		</div>
	);
}
