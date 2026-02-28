import { getMyProfile } from "@/services/profile";
import ProfileForm from "@/app/(DashboardLayout)/dashboard/profile/_components/ProfileForm";

export default async function AdminProfilePage() {
  const profileResult = await getMyProfile();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-primary">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and update your admin account details.
        </p>
      </div>

      <ProfileForm
        initialProfile={profileResult.data || null}
        fetchError={!profileResult.success ? profileResult.message : undefined}
      />
    </div>
  );
}
