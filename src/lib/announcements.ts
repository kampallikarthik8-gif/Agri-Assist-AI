import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, Timestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type AnnouncementDoc = {
  id: string;
  title: string;
  body: string;
  audience: "All" | "Farmers" | "Agronomists" | "Admins";
  publishedAt: string;
};

export async function fetchAnnouncements(): Promise<AnnouncementDoc[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, "announcements"), orderBy("publishedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data: any = d.data();
    const publishedAt: string = (data.publishedAt instanceof Timestamp)
      ? data.publishedAt.toDate().toISOString()
      : (data.publishedAt || new Date().toISOString());
    return {
      id: d.id,
      title: data.title ?? "",
      body: data.body ?? "",
      audience: (data.audience as AnnouncementDoc["audience"]) ?? "All",
      publishedAt,
    } as AnnouncementDoc;
  });
}

export async function createAnnouncement(input: Omit<AnnouncementDoc, "id" | "publishedAt"> & { publishedAt?: string }): Promise<AnnouncementDoc> {
  const db = getFirestoreDb();
  const docRef = await addDoc(collection(db, "announcements"), {
    title: input.title,
    body: input.body,
    audience: input.audience,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : serverTimestamp(),
  });
  const publishedAtIso = input.publishedAt ?? new Date().toISOString();
  return { id: docRef.id, title: input.title, body: input.body, audience: input.audience, publishedAt: publishedAtIso };
}


