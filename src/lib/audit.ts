import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, Timestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type AuditLog = {
  id: string;
  actor: string;
  action: string;
  target?: string;
  severity: "info" | "warning" | "error";
  at: string;
};

export async function writeAudit(actor: string, action: string, options?: { target?: string; severity?: AuditLog["severity"] }): Promise<void> {
  const db = getFirestoreDb();
  await addDoc(collection(db, "auditLogs"), {
    actor,
    action,
    target: options?.target ?? null,
    severity: options?.severity ?? "info",
    at: serverTimestamp(),
  });
}

export async function fetchAuditLogs(limitTo?: number): Promise<AuditLog[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, "auditLogs"), orderBy("at", "desc"));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => {
    const data: any = d.data();
    const atIso: string = (data.at instanceof Timestamp) ? data.at.toDate().toISOString() : new Date().toISOString();
    return {
      id: d.id,
      actor: data.actor ?? "System",
      action: data.action ?? "",
      target: data.target ?? undefined,
      severity: (data.severity as AuditLog["severity"]) ?? "info",
      at: atIso,
    } as AuditLog;
  });
  return typeof limitTo === "number" ? rows.slice(0, limitTo) : rows;
}


