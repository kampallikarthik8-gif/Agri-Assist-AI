"use client";

import { getFirestoreDb } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc } from "firebase/firestore";

export type CropRecord = {
  id: string;
  cropName: string;
  variety?: string;
  plantingDate: string; // ISO string
  area: number;
  areaUnit: string;
  growthStage: string;
};

const CROPS_KEY = "my_crops_list";

function hasFirestore(): boolean {
  return Boolean(
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export function observeCrops(callback: (rows: CropRecord[]) => void): () => void {
  if (!hasFirestore()) {
    try {
      const raw = localStorage.getItem(CROPS_KEY);
      const rows: CropRecord[] = raw ? JSON.parse(raw) : [];
      callback(rows);
    } catch { callback([]); }
    const handler = () => {
      try { callback(JSON.parse(localStorage.getItem(CROPS_KEY) || '[]')); } catch { callback([]); }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
  const db = getFirestoreDb();
  const q = query(collection(db, 'crops'));
  return onSnapshot(q, (snap) => {
    const rows: CropRecord[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    callback(rows);
  });
}

export async function addCrop(rec: Omit<CropRecord, 'id'>) {
  if (!hasFirestore()) {
    const rows: CropRecord[] = JSON.parse(localStorage.getItem(CROPS_KEY) || '[]');
    const next = [{ id: crypto.randomUUID(), ...rec }, ...rows];
    localStorage.setItem(CROPS_KEY, JSON.stringify(next));
    return;
  }
  const db = getFirestoreDb();
  await addDoc(collection(db, 'crops'), { ...rec, createdAt: serverTimestamp() });
}

export async function updateCrop(id: string, updates: Partial<CropRecord>) {
  if (!hasFirestore()) {
    const rows: CropRecord[] = JSON.parse(localStorage.getItem(CROPS_KEY) || '[]');
    const next = rows.map(r => r.id === id ? { ...r, ...updates } : r);
    localStorage.setItem(CROPS_KEY, JSON.stringify(next));
    return;
  }
  const db = getFirestoreDb();
  await updateDoc(doc(db, 'crops', id), updates as any);
}

export async function deleteCrop(id: string) {
  if (!hasFirestore()) {
    const rows: CropRecord[] = JSON.parse(localStorage.getItem(CROPS_KEY) || '[]');
    const next = rows.filter(r => r.id !== id);
    localStorage.setItem(CROPS_KEY, JSON.stringify(next));
    return;
  }
  const db = getFirestoreDb();
  await deleteDoc(doc(db, 'crops', id));
}


