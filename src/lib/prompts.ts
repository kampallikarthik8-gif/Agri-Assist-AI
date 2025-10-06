"use client";

import { getFirestoreDb } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";

export type QuickPrompt = { id: string; title: string; text: string; pinned?: boolean };

const PROMPTS_KEY = "ai_quick_prompts_v1";

function hasFirestore() {
  return Boolean(typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
}

export function observePrompts(cb: (rows: QuickPrompt[]) => void): () => void {
  if (!hasFirestore()) {
    try {
      const raw = localStorage.getItem(PROMPTS_KEY);
      const rows: QuickPrompt[] = raw ? JSON.parse(raw) : [];
      cb(rows);
    } catch { cb([]); }
    const handler = () => {
      try { cb(JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]')); } catch { cb([]); }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
  const db = getFirestoreDb();
  const q = query(collection(db, 'prompts'));
  return onSnapshot(q, (snap) => {
    const rows: QuickPrompt[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    cb(rows);
  });
}

export async function addPrompt(p: Omit<QuickPrompt, 'id'>) {
  if (!hasFirestore()) {
    const rows: QuickPrompt[] = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    const next = [{ id: crypto.randomUUID(), ...p }, ...rows];
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(next));
    return;
  }
  const db = getFirestoreDb();
  await addDoc(collection(db, 'prompts'), { ...p, createdAt: serverTimestamp() });
}

export async function updatePrompt(id: string, updates: Partial<QuickPrompt>) {
  if (!hasFirestore()) {
    const rows: QuickPrompt[] = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    const next = rows.map(r => r.id === id ? { ...r, ...updates } : r);
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(next));
    return;
  }
  const db = getFirestoreDb();
  await updateDoc(doc(db, 'prompts', id), updates as any);
}

export async function deletePrompt(id: string) {
  if (!hasFirestore()) {
    const rows: QuickPrompt[] = JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]');
    const next = rows.filter(r => r.id !== id);
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(next));
    return;
  }
  const db = getFirestoreDb();
  await deleteDoc(doc(db, 'prompts', id));
}


