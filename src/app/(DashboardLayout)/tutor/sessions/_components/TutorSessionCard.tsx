"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, Clock3, Loader2, UserRound, XCircle } from "lucide-react";
import { completeBooking } from "@/services/bookings";
import type { TutorBooking } from "@/types/tutor-dashboard";

type TutorSessionCardProps = {
  booking: TutorBooking;
  section: "upcoming" | "completed" | "cancelled";
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date TBD";
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Time TBD";
  return parsed.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TutorSessionCard({ booking, section }: TutorSessionCardProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(section);

  const handleMarkAsComplete = () => {
    if (localStatus !== "upcoming") return;

    setError("");
    startTransition(async () => {
      const result = await completeBooking(booking.id);
      if (!result.success) {
        setError(result.message || "Failed to mark session as completed.");
        return;
      }

      setLocalStatus("completed");
      router.refresh();
    });
  };

  const statusBadge =
    localStatus === "completed"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
      : localStatus === "cancelled"
        ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";

  return (
    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col gap-5 hover:shadow-md dark:shadow-[0_4px_20px_rgb(0,0,0,0.1)] transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <h3 className="font-bold text-foreground font-heading">Session #{booking.id.slice(0, 8)}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">{booking.id}</p>
        </div>
        <span className={`${statusBadge} capitalize px-3 py-1.5 text-xs font-bold rounded-xl`}>
          {localStatus === "cancelled" ? "Canceled" : localStatus}
        </span>
      </div>

      <div className="space-y-2 text-sm text-foreground/80 bg-muted/30 border border-border/50 p-4 rounded-2xl relative z-10 transition-colors hover:bg-muted/50">
        <p className="flex items-center gap-2">
          <UserRound className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium">Student ID:</span> <span className="font-mono text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded-md border border-border">{booking.studentId}</span>
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium">{formatDate(booking.sessionDate)}</span>
        </p>
        <p className="flex items-center gap-2">
          <Clock3 className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium font-mono text-xs mt-0.5">{formatTime(booking.sessionDate)}</span>
        </p>
      </div>

      <div className="mt-auto pt-2 relative z-10">
        {localStatus === "upcoming" ? (
          <button
            type="button"
            onClick={handleMarkAsComplete}
            disabled={isPending}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-colors shadow-md ${
              isPending ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Mark as Complete
              </>
            )}
          </button>
        ) : localStatus === "completed" ? (
          <button
            type="button"
            disabled
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            Canceled
          </button>
        )}

        {error && <p className="mt-2 text-xs text-destructive font-medium text-center">{error}</p>}
      </div>
    </div>
  );
}
