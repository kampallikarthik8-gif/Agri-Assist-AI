"use client";

import { getFirestoreDb } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

export type TaskItem = { id: string; title: string; type: string; due: string; done: boolean };

const TASKS_KEY = "tasks_planner_v1";

function hasFirestore(): boolean {
  return Boolean(
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

// Local fallback
function readLocalTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? (JSON.parse(raw) as TaskItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocalTasks(tasks: TaskItem[]) {
  try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch {}
}

export function observeTasks(callback: (tasks: TaskItem[]) => void): () => void {
  if (!hasFirestore()) {
    // Emit once and subscribe to storage events
    const tasks = readLocalTasks();
    callback(tasks);
    const handler = () => callback(readLocalTasks());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }

  // Firestore live subscription
  try {
    const db = getFirestoreDb();
    const q = query(collection(db, "tasks"));
    const unsub = onSnapshot(q, (snap) => {
      const rows: TaskItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      callback(rows);
    });
    return unsub;
  } catch {
    // Fallback to local if Firestore init fails at runtime
    const tasks = readLocalTasks();
    callback(tasks);
    const handler = () => callback(readLocalTasks());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
}

export async function addTaskItem(item: Omit<TaskItem, "id">): Promise<void> {
  if (!hasFirestore()) {
    const current = readLocalTasks();
    const next: TaskItem = { id: crypto.randomUUID(), ...item };
    writeLocalTasks([next, ...current]);
    return;
  }
  const db = getFirestoreDb();
  await addDoc(collection(db, "tasks"), { ...item, createdAt: serverTimestamp() });
}

export async function updateTaskItem(id: string, updates: Partial<TaskItem>): Promise<void> {
  if (!hasFirestore()) {
    const current = readLocalTasks();
    const next = current.map((t) => (t.id === id ? { ...t, ...updates } : t));
    writeLocalTasks(next);
    return;
  }
  const db = getFirestoreDb();
  await updateDoc(doc(db, "tasks", id), updates as any);
}

export async function deleteTaskItem(id: string): Promise<void> {
  if (!hasFirestore()) {
    const current = readLocalTasks();
    const next = current.filter((t) => t.id !== id);
    writeLocalTasks(next);
    return;
  }
  const db = getFirestoreDb();
  await deleteDoc(doc(db, "tasks", id));
}


