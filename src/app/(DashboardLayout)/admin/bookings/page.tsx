import { Calendar, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { getAdminBookings } from "@/services/admin";

const normalizeStatus = (status: string) => {
  const lowered = status.trim().toLowerCase();
  if (lowered === "canceled") return "cancelled";
  return lowered;
};

const formatDate = (value: string) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClasses = (status: string) => {
  if (status === "completed") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
  if (status === "cancelled") return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
  if (status === "confirmed") return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
  return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
};

export default async function AdminBookingsPage() {
  const bookingsResult = await getAdminBookings();
  const bookings = bookingsResult.data || [];

  const sortedBookings = [...bookings].sort((a, b) => {
    const timeA = a.sessionDate ? new Date(a.sessionDate).getTime() : 0;
    const timeB = b.sessionDate ? new Date(b.sessionDate).getTime() : 0;
    return timeB - timeA;
  });

  const completedCount = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "completed"
  ).length;
  const cancelledCount = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "cancelled"
  ).length;
  const activeCount = bookings.filter((booking) => {
    const normalized = normalizeStatus(booking.status);
    return normalized !== "completed" && normalized !== "cancelled";
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-primary">Bookings</h1>
        <p className="text-muted-foreground mt-1 font-sans">View all platform booking sessions.</p>
      </div>

      {!bookingsResult.success && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 text-sm font-medium">
          {bookingsResult.message || "Failed to load bookings."}
        </div>
      )}

      <div className="grid auto-rows-min gap-4 sm:grid-cols-3">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-blue-500/30 group">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total bookings</p>
            <p className="font-bold text-foreground font-heading text-xl">{bookings.length}</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-emerald-500/30 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Completed</p>
            <p className="font-bold text-foreground font-heading text-xl">{completedCount}</p>
          </div>
        </div>
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:border-amber-500/30 group">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Active</p>
            <p className="font-bold text-foreground font-heading text-xl">{activeCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)]">
        {sortedBookings.length === 0 ? (
          <div className="p-10 text-center font-medium bg-muted/20">
            <p className="text-muted-foreground">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Booking ID</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Student</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Tutor</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Category</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Session Date</th>
                  <th className="text-left px-5 py-4 font-bold text-foreground uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sortedBookings.map((booking) => {
                  const normalizedStatus = normalizeStatus(booking.status) || "pending";

                  return (
                    <tr key={booking.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-5 py-4 font-mono text-xs font-bold text-muted-foreground bg-background rounded-md m-2 border border-border inline-block mt-4 ml-4 mb-4">{booking.id}</td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        {booking.studentName || booking.studentId || "N/A"}
                      </td>
                      <td className="px-5 py-4 font-bold text-foreground">
                        {booking.tutorName || booking.tutorId || "N/A"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-medium">{booking.categoryName || "N/A"}</td>
                      <td className="px-5 py-4 text-foreground font-medium">
                        <div className="flex flex-col">
                          <span>{formatDate(booking.sessionDate)}</span>
                          <span className="text-xs text-muted-foreground font-mono mt-0.5">
                            {formatTime(booking.sessionDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`${getStatusClasses(
                            normalizedStatus
                          )} inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold capitalize shadow-sm`}
                        >
                          {normalizedStatus === "cancelled" ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 mr-1.5" />
                              Canceled
                            </>
                          ) : (
                            normalizedStatus
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cancelledCount > 0 && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 shadow-sm">
          <p className="text-sm font-bold text-destructive">
            {cancelledCount} booking{cancelledCount > 1 ? "s are" : " is"} currently canceled.
          </p>
        </div>
      )}
    </div>
  );
}
