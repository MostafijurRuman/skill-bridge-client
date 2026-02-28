import { getTutorDashboardMe } from "@/services/tutor-management";
import TutorAvailabilityForm from "./_components/TutorAvailabilityForm";

export default async function TutorAvailabilityPage() {
  const result = await getTutorDashboardMe();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-secondary">Tutor Availability</h1>
        <p className="text-muted-foreground mt-1">
          Set your weekly time slots for students to book sessions.
        </p>
      </div>

      <TutorAvailabilityForm
        initialAvailability={result.data?.availability || []}
        fetchError={!result.success ? result.message : undefined}
      />
    </div>
  );
}
