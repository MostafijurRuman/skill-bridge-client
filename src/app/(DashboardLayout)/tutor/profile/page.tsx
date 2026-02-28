import { getMyProfile } from "@/services/profile";
import { getTutorDashboardMe } from "@/services/tutor-management";
import TutorProfileForm from "./_components/TutorProfileForm";

export default async function TutorProfilePage() {
  const [userResult, tutorResult] = await Promise.all([
    getMyProfile(),
    getTutorDashboardMe(),
  ]);

  const fetchErrors = [userResult.message, tutorResult.message].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-secondary">Tutor Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your account and tutor information in one form.
        </p>
      </div>

      <TutorProfileForm
        initialUserProfile={userResult.data || null}
        initialTutorProfile={tutorResult.data || null}
        fetchError={(!userResult.success || !tutorResult.success) ? fetchErrors : undefined}
      />
    </div>
  );
}
