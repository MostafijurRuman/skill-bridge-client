import { CalendarDays } from "lucide-react";
import { getTutorDashboardMe } from "@/services/tutor-management";
import type { TutorBooking } from "@/types/tutor-dashboard";
import TutorSessionCard from "./_components/TutorSessionCard";

const normalizeStatus = (status: unknown) => {
  if (typeof status !== "string") return "upcoming";
  const lowered = status.toLowerCase();
  if (lowered === "completed") return "completed";
  if (lowered === "cancelled" || lowered === "canceled") return "cancelled";
  return "upcoming";
};

const getBookingTimestamp = (booking: TutorBooking) => {
  const sessionTime = new Date(booking.sessionDate).getTime();
  if (!Number.isNaN(sessionTime) && sessionTime > 0) return sessionTime;

  const createdAtTime = new Date(booking.createdAt).getTime();
  if (!Number.isNaN(createdAtTime) && createdAtTime > 0) return createdAtTime;

  return 0;
};

export default async function TutorSessionsPage() {
  const result = await getTutorDashboardMe();
  const bookings = result.data?.bookings || [];

  const sorted = [...bookings].sort(
    (a, b) => getBookingTimestamp(b) - getBookingTimestamp(a)
  );

  const upcoming = sorted.filter((booking) => normalizeStatus(booking.status) === "upcoming");
  const completed = sorted.filter((booking) => normalizeStatus(booking.status) === "completed");
  const cancelled = sorted.filter((booking) => normalizeStatus(booking.status) === "cancelled");

  const sections: Array<{
    id: "upcoming" | "completed" | "cancelled";
    title: string;
    description: string;
    items: TutorBooking[];
    emptyText: string;
  }> = [
    {
      id: "upcoming",
      title: "Upcoming Sessions",
      description: "Pending and confirmed sessions waiting to happen.",
      items: upcoming,
      emptyText: "No upcoming sessions.",
    },
    {
      id: "completed",
      title: "Completed Sessions",
      description: "Sessions that are already finished.",
      items: completed,
      emptyText: "No completed sessions yet.",
    },
    {
      id: "cancelled",
      title: "Canceled Sessions",
      description: "Sessions canceled by tutor or student.",
      items: cancelled,
      emptyText: "No canceled sessions.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-secondary">Sessions</h1>
        <p className="text-muted-foreground mt-1">
          View all sessions by status and complete upcoming sessions.
        </p>
      </div>

      {!result.success && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {result.message || "Unable to load sessions right now."}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white min-h-[45vh] rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <CalendarDays className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">No Sessions Found</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Your tutor account currently has no booking sessions.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                </div>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  {section.items.length}
                </span>
              </div>

              {section.items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
                  {section.emptyText}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {section.items.map((booking) => (
                    <TutorSessionCard key={booking.id} booking={booking} section={section.id} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
