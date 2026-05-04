"use client";

import { useState } from "react";
import { CalendarPlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  addTutorAvailabilitySlot,
  getTutorAvailabilityMe,
  removeTutorAvailabilitySlot,
  updateTutorAvailabilitySlot,
} from "@/services/tutor-management";
import type {
  TutorAvailabilityInput,
  TutorAvailabilitySlot,
} from "@/types/tutor-dashboard";

type TutorAvailabilityFormProps = {
  initialAvailability: TutorAvailabilitySlot[];
  fetchError?: string;
};

type EditableSlot = TutorAvailabilityInput & {
  localId: string;
  id?: string;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const createEmptySlot = (): EditableSlot => ({
  localId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  day: "Monday",
  startTime: "09:00",
  endTime: "17:00",
});

const toEditableSlot = (slot: TutorAvailabilitySlot): EditableSlot => ({
  localId: slot.id,
  id: slot.id,
  day: slot.day || "Monday",
  startTime: slot.startTime || "09:00",
  endTime: slot.endTime || "17:00",
});

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

const normalizeSlotsForValidation = (slots: EditableSlot[]): TutorAvailabilityInput[] =>
  slots.map((slot) => ({
    day: slot.day,
    startTime: slot.startTime,
    endTime: slot.endTime,
  }));

const toEditableSlots = (source: TutorAvailabilitySlot[]): EditableSlot[] =>
  source.length > 0 ? source.map(toEditableSlot) : [createEmptySlot()];

const hasOverlappingSlots = (slots: TutorAvailabilityInput[]) => {
  const grouped = new Map<string, TutorAvailabilityInput[]>();

  for (const slot of slots) {
    const list = grouped.get(slot.day) || [];
    list.push(slot);
    grouped.set(slot.day, list);
  }

  for (const daySlots of grouped.values()) {
    const sorted = [...daySlots].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    for (let i = 1; i < sorted.length; i += 1) {
      if (toMinutes(sorted[i].startTime) < toMinutes(sorted[i - 1].endTime)) {
        return true;
      }
    }
  }

  return false;
};

export default function TutorAvailabilityForm({
  initialAvailability,
  fetchError,
}: TutorAvailabilityFormProps) {
  const [savedSlots, setSavedSlots] = useState<TutorAvailabilitySlot[]>(initialAvailability);
  const [slots, setSlots] = useState<EditableSlot[]>(toEditableSlots(initialAvailability));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(fetchError || "");
  const [success, setSuccess] = useState("");

  const updateSlot = (localId: string, patch: Partial<EditableSlot>) => {
    setSlots((prev) => prev.map((slot) => (slot.localId === localId ? { ...slot, ...patch } : slot)));
  };

  const removeSlot = (localId: string) => {
    setSlots((prev) => prev.filter((slot) => slot.localId !== localId));
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, createEmptySlot()]);
  };

  const handleReset = () => {
    setSlots(toEditableSlots(savedSlots));
    setError("");
    setSuccess("");
  };

  const syncAvailabilityState = async () => {
    const refresh = await getTutorAvailabilityMe();
    if (!refresh.success || !refresh.data) {
      return false;
    }

    setSavedSlots(refresh.data);
    setSlots(toEditableSlots(refresh.data));
    return true;
  };

  const validateSlots = (payload: TutorAvailabilityInput[]) => {
    if (payload.length === 0) {
      return {
        valid: true,
        message: "",
      };
    }

    for (const slot of payload) {
      if (!DAYS.includes(slot.day)) {
        return {
          valid: false,
          message: "Please choose a valid day for each slot.",
        };
      }

      if (!slot.startTime || !slot.endTime) {
        return {
          valid: false,
          message: "Start time and end time are required for every slot.",
        };
      }

      if (toMinutes(slot.startTime) >= toMinutes(slot.endTime)) {
        return {
          valid: false,
          message: `Start time must be earlier than end time on ${slot.day}.`,
        };
      }
    }

    const uniqueSet = new Set<string>();
    for (const slot of payload) {
      const key = `${slot.day}|${slot.startTime}|${slot.endTime}`;
      if (uniqueSet.has(key)) {
        return {
          valid: false,
          message: `Duplicate slot detected: ${slot.day} ${slot.startTime} - ${slot.endTime}.`,
        };
      }
      uniqueSet.add(key);
    }

    if (hasOverlappingSlots(payload)) {
      return {
        valid: false,
        message: "Overlapping slots detected. Please adjust times for each day.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = normalizeSlotsForValidation(slots);
    const validation = validateSlots(payload);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setIsSaving(true);
    try {
      const persistedById = new Map(savedSlots.map((slot) => [slot.id, slot]));
      const currentWithId = slots.filter(
        (slot): slot is EditableSlot & { id: string } =>
          typeof slot.id === "string" && slot.id.trim().length > 0
      );
      const currentIds = new Set(currentWithId.map((slot) => slot.id));

      const removedSlotIds = savedSlots
        .filter((slot) => !currentIds.has(slot.id))
        .map((slot) => slot.id);

      const updatedSlots = currentWithId
        .map((slot) => {
          const original = persistedById.get(slot.id);
          if (!original) return null;

          const patch: Partial<TutorAvailabilityInput> = {};
          if (slot.day !== original.day) patch.day = slot.day;
          if (slot.startTime !== original.startTime) patch.startTime = slot.startTime;
          if (slot.endTime !== original.endTime) patch.endTime = slot.endTime;

          if (Object.keys(patch).length === 0) {
            return null;
          }

          return { id: slot.id, patch };
        })
        .filter((item): item is { id: string; patch: Partial<TutorAvailabilityInput> } => Boolean(item));

      const newSlots = slots
        .filter((slot) => !slot.id)
        .map((slot) => ({
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

      if (removedSlotIds.length === 0 && updatedSlots.length === 0 && newSlots.length === 0) {
        setSuccess("No availability changes to save.");
        return;
      }

      for (const slotId of removedSlotIds) {
        const removeResult = await removeTutorAvailabilitySlot(slotId);
        if (!removeResult.success) {
          await syncAvailabilityState();
          setError(removeResult.message || "Failed to remove availability slot.");
          return;
        }
      }

      for (const slot of updatedSlots) {
        const updateResult = await updateTutorAvailabilitySlot(slot.id, slot.patch);
        if (!updateResult.success) {
          await syncAvailabilityState();
          setError(updateResult.message || "Failed to update availability slot.");
          return;
        }
      }

      for (const slot of newSlots) {
        const addResult = await addTutorAvailabilitySlot(slot);
        if (!addResult.success) {
          await syncAvailabilityState();
          setError(addResult.message || "Failed to add availability slot.");
          return;
        }
      }

      const synced = await syncAvailabilityState();
      if (!synced) {
        setError("Availability was updated, but refresh failed. Please reload this page.");
        return;
      }

      setSuccess("Availability updated successfully.");
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to update availability."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm h-fit relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <h2 className="text-xl font-bold font-heading text-foreground mb-4 relative z-10">Tips</h2>
        <ul className="text-sm font-medium text-muted-foreground space-y-3 relative z-10 list-disc list-inside">
          <li>Use at least one slot to appear bookable for students.</li>
          <li>Avoid overlapping slots on the same day.</li>
          <li>Keep times consistent with your local teaching schedule.</li>
        </ul>

        <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 relative z-10">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Slots configured: <span className="font-bold text-lg ml-1">{slots.length}</span>
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="xl:col-span-2 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm space-y-6"
      >
        {error && (
          <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-bold shadow-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-sm">
            {success}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <h2 className="text-2xl font-bold font-heading text-foreground">Weekly Slots</h2>
          <Button type="button" variant="outline" onClick={addSlot} className="font-bold bg-muted/30 border-border hover:bg-muted/50 rounded-xl">
            <Plus className="w-4 h-4 mr-2 text-primary" />
            Add Slot
          </Button>
        </div>

        <div className="space-y-4">
          {slots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center text-sm font-medium text-muted-foreground">
              No slots set. Add one to get started.
            </div>
          ) : (
            slots.map((slot, index) => (
              <div
                key={slot.localId}
                className="rounded-2xl border border-border bg-muted/10 p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end transition-colors hover:border-primary/30"
              >
                <div className="space-y-2">
                  <Label htmlFor={`day-${slot.localId}`} className="font-bold text-foreground">Day</Label>
                  <select
                    id={`day-${slot.localId}`}
                    value={slot.day}
                    onChange={(event) => updateSlot(slot.localId, { day: event.target.value })}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-medium"
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`start-${slot.localId}`} className="font-bold text-foreground">Start Time</Label>
                  <input
                    id={`start-${slot.localId}`}
                    type="time"
                    value={slot.startTime}
                    onChange={(event) => updateSlot(slot.localId, { startTime: event.target.value })}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`end-${slot.localId}`} className="font-bold text-foreground">End Time</Label>
                  <input
                    id={`end-${slot.localId}`}
                    type="time"
                    value={slot.endTime}
                    onChange={(event) => updateSlot(slot.localId, { endTime: event.target.value })}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 font-bold rounded-xl text-destructive hover:text-white border-destructive/30 bg-destructive/5 hover:bg-destructive transition-colors w-full md:w-auto"
                  onClick={() => removeSlot(slot.localId)}
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>

                <p className="text-xs font-medium text-muted-foreground md:col-span-4 mt-2">
                  Slot <span className="text-foreground">{index + 1}</span>: {slot.day}, {slot.startTime} - {slot.endTime}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 flex items-center gap-3 border-t border-border mt-4">
          <Button type="submit" disabled={isSaving} className="min-w-36 h-11 rounded-xl font-bold bg-primary hover:bg-primary-dark shadow-md">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Availability
              </>
            )}
          </Button>

          <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving} className="h-11 rounded-xl font-bold border-border bg-card hover:bg-muted/50">
            Reset
          </Button>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 text-amber-600 dark:text-amber-400 text-sm font-medium">
          <CalendarPlus className="w-5 h-5 shrink-0" />
          <p>Students can only book within your configured slots.</p>
        </div>
      </form>
    </div>
  );
}
