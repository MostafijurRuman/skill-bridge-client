"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateAdminUserStatus } from "@/services/admin";

type UserStatusToggleProps = {
  userId: string;
  isBanned: boolean;
};

export default function UserStatusToggle({ userId, isBanned }: UserStatusToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");

  const nextState = !isBanned;

  const handleStatusUpdate = () => {
    setErrorMessage("");

    startTransition(async () => {
      const result = await updateAdminUserStatus(userId, nextState);
      if (!result.success) {
        setErrorMessage(result.message || "Failed to update user status.");
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleStatusUpdate}
        disabled={isPending}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          nextState
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
        } ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {nextState ? "Ban User" : "Unban User"}
      </button>

      {errorMessage && <p className="text-[11px] text-red-600">{errorMessage}</p>}
    </div>
  );
}
