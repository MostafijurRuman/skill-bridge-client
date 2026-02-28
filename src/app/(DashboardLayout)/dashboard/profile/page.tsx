import { getMyProfile } from "@/services/profile";
import ProfileForm from "./_components/ProfileForm";

export default async function StudentProfilePage() {
  const profileResult = await getMyProfile();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-primary">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and update your account details.
        </p>
      </div>

      <ProfileForm
        initialProfile={profileResult.data || null}
        fetchError={!profileResult.success ? profileResult.message : undefined}
      />
    </div>
  );
}
