"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function TasksPage() {
	const [tasks, setTasks] = useState<Array<{ id: string; title: string; type: string; due: string; done: boolean }>>([]);
	const [title, setTitle] = useState("");
	const [type, setType] = useState("General");
	const [due, setDue] = useState("");

    // Subscribe to data layer
    useEffect(() => {
        let unsub = () => {};
        import("@/lib/data-layer").then(mod => {
            unsub = mod.observeTasks((rows) => setTasks(rows));
        });
        return () => { try { unsub(); } catch {} };
    }, []);

	async function addTask() {
		if (!title.trim()) return;
		const payload = { title: title.trim(), type, due, done: false };
		const { addTaskItem } = await import("@/lib/data-layer");
		await addTaskItem(payload as any);
		setTitle("");
		setType("General");
		setDue("");
	}

	async function toggleDone(id: string) {
		const { updateTaskItem } = await import("@/lib/data-layer");
		const current = tasks.find(t => t.id === id);
		await updateTaskItem(id, { done: !current?.done });
	}

	async function removeTask(id: string) {
		const { deleteTaskItem } = await import("@/lib/data-layer");
		await deleteTaskItem(id);
	}

	const pending = useMemo(() => tasks.filter((t) => !t.done), [tasks]);
	const completed = useMemo(() => tasks.filter((t) => t.done), [tasks]);

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Icons.Calendar className="size-6 text-primary" />
						Farm Tasks Planner
					</CardTitle>
					<CardDescription>Plan and track sowing, spraying, irrigation, and harvest tasks.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-2">
						<Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
						<Select value={type} onValueChange={setType}>
							<SelectTrigger>
								<SelectValue placeholder="Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="General">General</SelectItem>
								<SelectItem value="Sowing">Sowing</SelectItem>
								<SelectItem value="Irrigation">Irrigation</SelectItem>
								<SelectItem value="Fertilizer">Fertilizer</SelectItem>
								<SelectItem value="Weeding">Weeding</SelectItem>
								<SelectItem value="Spraying">Spraying</SelectItem>
								<SelectItem value="Harvest">Harvest</SelectItem>
							</SelectContent>
						</Select>
						<Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
						<Button onClick={addTask}><Icons.Plus className="mr-2 h-4 w-4" /> Add</Button>
					</div>

					<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Pending</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{pending.length === 0 ? (
									<p className="text-muted-foreground text-sm">No pending tasks.</p>
								) : (
									pending.map((t) => (
										<div key={t.id} className="flex items-center justify-between border rounded-md p-2">
											<div className="flex items-center gap-2">
												<Checkbox checked={t.done} onCheckedChange={() => toggleDone(t.id)} />
												<div>
													<p className="font-medium">{t.title}</p>
													<p className="text-xs text-muted-foreground">{t.type}{t.due ? ` • Due ${t.due}` : ''}</p>
												</div>
											</div>
											<Button variant="ghost" size="icon" onClick={() => removeTask(t.id)}>
												<Icons.Trash className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									))
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Completed</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{completed.length === 0 ? (
									<p className="text-muted-foreground text-sm">No completed tasks.</p>
								) : (
									completed.map((t) => (
										<div key={t.id} className="flex items-center justify-between border rounded-md p-2 opacity-70">
											<div className="flex items-center gap-2">
												<Checkbox checked={t.done} onCheckedChange={() => toggleDone(t.id)} />
												<div>
													<p className="font-medium line-through">{t.title}</p>
													<p className="text-xs text-muted-foreground">{t.type}{t.due ? ` • Due ${t.due}` : ''}</p>
												</div>
											</div>
											<Button variant="ghost" size="icon" onClick={() => removeTask(t.id)}>
												<Icons.Trash className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									))
								)}
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
