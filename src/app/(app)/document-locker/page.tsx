
import { DocumentLocker } from "@/components/client/document-locker";

export default function DocumentLockerPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Document Locker</h1>
      <DocumentLocker />
    </div>
  );
}
