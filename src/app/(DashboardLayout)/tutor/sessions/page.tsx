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
        <h1 className="text-3xl font-bold font-heading text-primary">Sessions</h1>
        <p className="text-muted-foreground mt-1 font-sans">
          View all sessions by status and complete upcoming sessions.
        </p>
      </div>

      {!result.success && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 font-medium text-sm">
          {result.message || "Unable to load sessions right now."}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-card min-h-[45vh] rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-muted/50 text-muted-foreground flex items-center justify-center mb-6 relative z-10 border border-border">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-foreground relative z-10">No Sessions Found</h2>
          <p className="text-muted-foreground mt-2 max-w-md relative z-10">
            Your tutor account currently has no booking sessions.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} className="space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-bold font-heading text-foreground">{section.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                </div>
                <span className="text-sm font-bold px-3 py-1.5 rounded-xl bg-muted/50 text-foreground border border-border">
                  {section.items.length}
                </span>
              </div>

              {section.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm font-medium text-muted-foreground">
                  {section.emptyText}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
