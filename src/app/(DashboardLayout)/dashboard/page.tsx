import { getMyBookings } from "@/services/bookings";
import { ArrowRight, Calendar, CheckCircle2, Clock, Video, XCircle } from "lucide-react";
import Link from "next/link";

type Booking = {
  id?: string;
  status?: string;
  sessionDate?: string;
  meetingLink?: string;
  createdAt?: string;
  tutor?: {
    user?: {
      name?: string;
    };
    categories?: {
      name?: string;
    }[];
  };
};

const normalizeStatus = (status: unknown) => {
  if (typeof status !== "string") return "";
  const lowered = status.toLowerCase();
  if (lowered === "canceled" || lowered === "cancelled") return "cancelled";
  return lowered;
};

const getStatusClasses = (status: string) => {
  if (status === "completed") return "bg-blue-100/50 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400";
  if (status === "cancelled") return "bg-red-100/50 dark:bg-red-500/20 text-red-800 dark:text-red-400";
  if (status === "confirmed") return "bg-green-100/50 dark:bg-green-500/20 text-green-800 dark:text-green-400";
  return "bg-yellow-100/50 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400";
};

const getActivityText = (status: string) => {
  if (status === "completed") return "Session completed";
  if (status === "cancelled") return "Session canceled";
  if (status === "confirmed") return "Session confirmed";
  return "Session scheduled";
};

const getCreatedAtSortValue = (createdAt?: string) => {
  if (!createdAt) return 0;
  const timestamp = new Date(createdAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export default async function StudentDashboardPage() {
  const result = await getMyBookings();
  const bookings: Booking[] = Array.isArray(result?.data) ? result.data : [];

  const upcomingCount = bookings.filter((booking) => {
    const status = normalizeStatus(booking?.status);
    return status !== "completed" && status !== "cancelled";
  }).length;

  const completedCount = bookings.filter(
    (booking) => normalizeStatus(booking?.status) === "completed"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => normalizeStatus(booking?.status) === "cancelled"
  ).length;

  const recentActivities = [...bookings]
    .sort((a, b) => getCreatedAtSortValue(b?.createdAt) - getCreatedAtSortValue(a?.createdAt))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-primary">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1 font-sans">Track your latest session progress and activity.</p>
        </div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground text-sm font-medium transition-colors shadow-sm"
        >
          View Bookings
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {!result.success && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 font-medium text-sm">
          <p>{result.message || "Failed to load dashboard data. Please try again later."}</p>
        </div>
      )}

      <div className="grid auto-rows-min gap-6 md:grid-cols-3">
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Upcoming Sessions</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{upcomingCount}</span>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Completed Sessions</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{completedCount}</span>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-shadow flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <span className="text-muted-foreground font-medium text-sm relative z-10">Canceled Sessions</span>
          <span className="text-4xl font-bold text-foreground font-heading relative z-10">{cancelledCount}</span>
        </div>
      </div>

      <div className="bg-card min-h-[50vh] p-6 sm:p-8 flex-1 rounded-3xl border border-border shadow-sm dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex items-center justify-between gap-3 mb-6 relative z-10 border-b border-border pb-4">
          <h2 className="text-xl font-bold font-heading text-foreground">Recent Activity</h2>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors hover:underline">
            See all
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <div className="border border-dashed border-border bg-muted/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center relative z-10">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any recent activity yet. Start by booking a new session.
            </p>
            <Link
              href="/tutors"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all"
            >
              Find a Tutor
            </Link>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {recentActivities.map((booking, index) => {
              const status = normalizeStatus(booking?.status) || "pending";
              const statusClasses = getStatusClasses(status);
              const tutorName = booking?.tutor?.user?.name || "Tutor";
              const subject = booking?.tutor?.categories?.[0]?.name || "General Session";
              const sessionDate = booking?.sessionDate ? new Date(booking.sessionDate) : null;
              const isValidDate = Boolean(sessionDate && !Number.isNaN(sessionDate.getTime()));

              return (
                <div
                  key={booking.id || index}
                  className="bg-muted/30 dark:bg-muted/10 border border-border/60 hover:border-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all hover:shadow-md dark:hover:shadow-primary/5 group"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      {status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      ) : status === "cancelled" ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Calendar className="w-5 h-5 text-primary" />
                      )}
                      <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                        {getActivityText(status)} <span className="font-medium text-muted-foreground">with</span> {tutorName}
                      </p>
                    </div>

                    <p className="text-sm font-medium text-muted-foreground ml-7">{subject}</p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground ml-7 mt-1">
                      <span className="inline-flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-lg shadow-sm">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {isValidDate
                          ? sessionDate!.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Date TBD"}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-lg shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {isValidDate
                          ? sessionDate!.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Time TBD"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`${statusClasses} capitalize px-3 py-1.5 text-xs font-bold rounded-xl border border-current/20`}>
                      {status === "cancelled" ? "Canceled" : status}
                    </span>

                    {booking?.meetingLink && status !== "completed" && status !== "cancelled" && (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        <Video className="w-4 h-4" />
                        Join Call
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
