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
      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm h-fit">
        <h2 className="text-lg font-bold font-heading text-slate-900 mb-3">Tips</h2>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>Use at least one slot to appear bookable for students.</li>
          <li>Avoid overlapping slots on the same day.</li>
          <li>Keep times consistent with your local teaching schedule.</li>
        </ul>

        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-3">
          <p className="text-xs text-blue-700">
            Slots configured: <span className="font-semibold">{slots.length}</span>
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="xl:col-span-2 bg-white p-6 rounded-2xl border border-border shadow-sm space-y-5"
      >
        {error && (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
            {success}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-slate-900">Weekly Slots</h2>
          <Button type="button" variant="outline" onClick={addSlot}>
            <Plus className="w-4 h-4" />
            Add Slot
          </Button>
        </div>

        <div className="space-y-3">
          {slots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No slots set. Add one to get started.
            </div>
          ) : (
            slots.map((slot, index) => (
              <div
                key={slot.localId}
                className="rounded-xl border border-border p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
              >
                <div className="space-y-2">
                  <Label htmlFor={`day-${slot.localId}`}>Day</Label>
                  <select
                    id={`day-${slot.localId}`}
                    value={slot.day}
                    onChange={(event) => updateSlot(slot.localId, { day: event.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`start-${slot.localId}`}>Start Time</Label>
                  <input
                    id={`start-${slot.localId}`}
                    type="time"
                    value={slot.startTime}
                    onChange={(event) => updateSlot(slot.localId, { startTime: event.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`end-${slot.localId}`}>End Time</Label>
                  <input
                    id={`end-${slot.localId}`}
                    type="time"
                    value={slot.endTime}
                    onChange={(event) => updateSlot(slot.localId, { endTime: event.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => removeSlot(slot.localId)}
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>

                <p className="text-xs text-muted-foreground md:col-span-4">
                  Slot {index + 1}: {slot.day}, {slot.startTime} - {slot.endTime}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button type="submit" disabled={isSaving} className="min-w-36">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Availability
              </>
            )}
          </Button>

          <Button type="button" variant="outline" onClick={handleReset} disabled={isSaving}>
            Reset
          </Button>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-amber-700 text-xs">
          <CalendarPlus className="w-4 h-4 mt-0.5" />
          Students can only book within your configured slots.
        </div>
      </form>
    </div>
  );
}
