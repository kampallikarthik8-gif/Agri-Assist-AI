import { ProfileForm } from "@/components/client/profile-form";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Profile</h1>
      <ProfileForm />
    </div>
  );
}
