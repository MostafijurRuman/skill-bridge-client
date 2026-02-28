"use server";

import { cookies } from "next/headers";
import { updateMyProfile } from "@/services/profile";
import type { UpdateProfilePayload, UserProfile } from "@/types/profile";
import type {
  TutorAvailabilityInput,
  TutorAvailabilityPatchPayload,
  TutorAvailabilitySlot,
  TutorAvailabilityUpdatePayload,
  TutorBooking,
  TutorCategory,
  TutorCombinedProfileUpdatePayload,
  TutorCombinedProfileUpdateResult,
  TutorDashboardData,
  TutorProfileUpdatePayload,
  TutorReview,
} from "@/types/tutor-dashboard";

type TutorActionResult<T = unknown> = {
  success: boolean;
  status?: number;
  message?: string;
  data?: T;
};

const DAYS = new Set([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const getBaseUrl = () =>
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

const parseResponseBody = (raw: string): unknown => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { message: raw };
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getMessage = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) return undefined;
  return typeof payload.message === "string" ? payload.message : undefined;
};

const toRecordArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => isRecord(item)) : [];

const parseBooking = (input: Record<string, unknown>): TutorBooking | null => {
  const id = typeof input.id === "string" ? input.id : "";
  const studentId = typeof input.studentId === "string" ? input.studentId : "";
  const tutorId = typeof input.tutorId === "string" ? input.tutorId : "";
  const sessionDate = typeof input.sessionDate === "string" ? input.sessionDate : "";
  const createdAt = typeof input.createdAt === "string" ? input.createdAt : "";

  if (!id || !studentId || !tutorId) return null;

  return {
    id,
    studentId,
    tutorId,
    sessionDate,
    status: typeof input.status === "string" ? input.status : "PENDING",
    createdAt,
  };
};

const parseReview = (input: Record<string, unknown>): TutorReview | null => {
  const id = typeof input.id === "string" ? input.id : "";
  const studentId = typeof input.studentId === "string" ? input.studentId : "";
  const tutorId = typeof input.tutorId === "string" ? input.tutorId : "";
  if (!id || !studentId || !tutorId) return null;

  return {
    id,
    rating: typeof input.rating === "number" ? input.rating : Number(input.rating) || 0,
    comment: typeof input.comment === "string" ? input.comment : "",
    createdAt: typeof input.createdAt === "string" ? input.createdAt : "",
    studentId,
    tutorId,
  };
};

const parseAvailability = (input: Record<string, unknown>): TutorAvailabilitySlot | null => {
  const id = typeof input.id === "string" ? input.id : "";
  const tutorId = typeof input.tutorId === "string" ? input.tutorId : "";
  const day = typeof input.day === "string" ? input.day : "";
  const startTime = typeof input.startTime === "string" ? input.startTime : "";
  const endTime = typeof input.endTime === "string" ? input.endTime : "";

  if (!id || !day || !startTime || !endTime) return null;

  return {
    id,
    tutorId,
    day,
    startTime,
    endTime,
  };
};

const extractAvailabilitySlots = (payload: unknown): TutorAvailabilitySlot[] => {
  const slotMap = new Map<string, TutorAvailabilitySlot>();

  const collect = (value: unknown) => {
    if (isRecord(value)) {
      const parsed = parseAvailability(value);
      if (parsed) {
        slotMap.set(parsed.id, parsed);
      }
    }
  };

  if (!isRecord(payload)) {
    return [];
  }

  collect(payload);

  if (Array.isArray(payload.availability)) {
    toRecordArray(payload.availability).forEach(collect);
  }

  if (Array.isArray(payload.data)) {
    toRecordArray(payload.data).forEach(collect);
  }

  if (isRecord(payload.data)) {
    collect(payload.data);
    if (Array.isArray(payload.data.availability)) {
      toRecordArray(payload.data.availability).forEach(collect);
    }
  }

  return [...slotMap.values()];
};

const parseCategory = (input: Record<string, unknown>): TutorCategory | null => {
  const id = typeof input.id === "string" ? input.id : "";
  const name = typeof input.name === "string" ? input.name : "";
  if (!id || !name) return null;
  return { id, name };
};

const extractTutorDashboard = (payload: unknown): TutorDashboardData | undefined => {
  if (!isRecord(payload)) return undefined;

  const source =
    isRecord(payload.data) && !Array.isArray(payload.data)
      ? payload.data
      : payload;

  const id = typeof source.id === "string" ? source.id : "";
  const userId = typeof source.userId === "string" ? source.userId : "";

  if (!id || !userId) return undefined;

  return {
    id,
    userId,
    bio: typeof source.bio === "string" ? source.bio : "",
    pricePerHr:
      typeof source.pricePerHr === "number"
        ? source.pricePerHr
        : Number(source.pricePerHr) || 0,
    rating: typeof source.rating === "number" ? source.rating : Number(source.rating) || 0,
    bookings: toRecordArray(source.bookings).map(parseBooking).filter((item): item is TutorBooking => Boolean(item)),
    reviews: toRecordArray(source.reviews).map(parseReview).filter((item): item is TutorReview => Boolean(item)),
    availability: toRecordArray(source.availability)
      .map(parseAvailability)
      .filter((item): item is TutorAvailabilitySlot => Boolean(item)),
    categories: toRecordArray(source.categories).map(parseCategory).filter((item): item is TutorCategory => Boolean(item)),
  };
};

const getAuthHeaders = async (): Promise<TutorActionResult<Headers>> => {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("token")?.value?.trim() ||
    cookieStore.get("better-auth.session_token")?.value?.trim() ||
    cookieStore.get("__Secure-better-auth.session_token")?.value?.trim();

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    return { success: true, data: headers };
  }

  const secureSession = cookieStore.get("__Secure-better-auth.session_token")?.value;
  const normalSession = cookieStore.get("better-auth.session_token")?.value;

  if (secureSession) {
    headers.set("Cookie", `__Secure-better-auth.session_token=${secureSession}`);
    return { success: true, data: headers };
  }

  if (normalSession) {
    headers.set("Cookie", `better-auth.session_token=${normalSession}`);
    return { success: true, data: headers };
  }

  return {
    success: false,
    message: "Unauthorized. Please log in first.",
  };
};

const normalizeTutorProfilePayload = (
  payload: TutorProfileUpdatePayload
): TutorActionResult<TutorProfileUpdatePayload> => {
  const normalized: TutorProfileUpdatePayload = {};

  if (Object.prototype.hasOwnProperty.call(payload, "bio")) {
    if (typeof payload.bio !== "string") {
      return { success: false, message: "Bio must be a string." };
    }
    normalized.bio = payload.bio.trim();
  }

  if (Object.prototype.hasOwnProperty.call(payload, "pricePerHr")) {
    const amount = Number(payload.pricePerHr);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, message: "Price per hour must be a positive number." };
    }
    normalized.pricePerHr = Math.round(amount * 100) / 100;
  }

  if (Object.keys(normalized).length === 0) {
    return {
      success: false,
      message: "No valid tutor fields were provided.",
    };
  }

  return { success: true, data: normalized };
};

const normalizeAvailabilityRow = (
  row: TutorAvailabilityInput
): TutorActionResult<TutorAvailabilityInput> => {
  const day = typeof row.day === "string" ? row.day.trim() : "";
  const startTime = typeof row.startTime === "string" ? row.startTime.trim() : "";
  const endTime = typeof row.endTime === "string" ? row.endTime.trim() : "";

  if (!DAYS.has(day)) {
    return { success: false, message: `Invalid day value: ${day || "empty"}.` };
  }

  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    return { success: false, message: "Time values must use HH:mm format (24-hour)." };
  }

  if (startTime >= endTime) {
    return { success: false, message: `Start time must be earlier than end time for ${day}.` };
  }

  return {
    success: true,
    data: {
      day,
      startTime,
      endTime,
    },
  };
};

const normalizeAvailabilityPayload = (
  payload: TutorAvailabilityUpdatePayload
): TutorActionResult<TutorAvailabilityUpdatePayload> => {
  if (!payload || !Array.isArray(payload.availability)) {
    return {
      success: false,
      message: "Availability must be an array.",
    };
  }

  const normalized: TutorAvailabilityInput[] = [];
  const seen = new Set<string>();

  for (const row of payload.availability) {
    const rowResult = normalizeAvailabilityRow(row);
    if (!rowResult.success || !rowResult.data) {
      return {
        success: false,
        message: rowResult.message || "Invalid availability row.",
      };
    }

    const key = `${rowResult.data.day}|${rowResult.data.startTime}|${rowResult.data.endTime}`;
    if (seen.has(key)) {
      return {
        success: false,
        message: `Duplicate slot found: ${rowResult.data.day} ${rowResult.data.startTime}-${rowResult.data.endTime}.`,
      };
    }

    seen.add(key);
    normalized.push(rowResult.data);
  }

  return {
    success: true,
    data: { availability: normalized },
  };
};

const normalizeAvailabilityPatchPayload = (
  payload: TutorAvailabilityPatchPayload
): TutorActionResult<TutorAvailabilityPatchPayload> => {
  const normalized: TutorAvailabilityPatchPayload = {};

  if (Object.prototype.hasOwnProperty.call(payload, "day")) {
    const day = typeof payload.day === "string" ? payload.day.trim() : "";
    if (!DAYS.has(day)) {
      return { success: false, message: `Invalid day value: ${day || "empty"}.` };
    }
    normalized.day = day;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "startTime")) {
    const startTime =
      typeof payload.startTime === "string" ? payload.startTime.trim() : "";
    if (!TIME_RE.test(startTime)) {
      return { success: false, message: "Start time must use HH:mm format (24-hour)." };
    }
    normalized.startTime = startTime;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "endTime")) {
    const endTime = typeof payload.endTime === "string" ? payload.endTime.trim() : "";
    if (!TIME_RE.test(endTime)) {
      return { success: false, message: "End time must use HH:mm format (24-hour)." };
    }
    normalized.endTime = endTime;
  }

  if (Object.keys(normalized).length === 0) {
    return {
      success: false,
      message: "No valid availability fields were provided.",
    };
  }

  if (
    typeof normalized.startTime === "string" &&
    typeof normalized.endTime === "string" &&
    normalized.startTime >= normalized.endTime
  ) {
    return {
      success: false,
      message: "Start time must be earlier than end time.",
    };
  }

  return { success: true, data: normalized };
};

type AvailabilityAttemptResult = {
  ok: boolean;
  status: number;
  message: string;
  dashboard?: TutorDashboardData;
};

const sendAvailabilityRequest = async (
  baseUrl: string,
  headers: Headers,
  body: unknown
): Promise<AvailabilityAttemptResult> => {
  const response = await fetch(`${baseUrl}/api/tutors/availability`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const raw = await response.text();
  const parsed = parseResponseBody(raw);
  const dashboard = extractTutorDashboard(parsed);
  const message =
    getMessage(parsed) || `Failed to update availability (status ${response.status}).`;

  return {
    ok: response.ok,
    status: response.status,
    message,
    dashboard,
  };
};

export const getTutorDashboardMe = async (): Promise<TutorActionResult<TutorDashboardData>> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
      };
    }

    const authResult = await getAuthHeaders();
    if (!authResult.success || !authResult.data) {
      return {
        success: false,
        message: authResult.message || "Unauthorized. Please log in first.",
      };
    }

    const response = await fetch(`${baseUrl}/api/tutors/dashboard/me`, {
      method: "GET",
      headers: authResult.data,
      cache: "no-store",
    });

    const raw = await response.text();
    const parsed = parseResponseBody(raw);
    const dashboard = extractTutorDashboard(parsed);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: getMessage(parsed) || `Failed to fetch tutor dashboard (status ${response.status}).`,
      };
    }

    if (!dashboard) {
      return {
        success: false,
        status: response.status,
        message: "Tutor dashboard response is missing required fields.",
      };
    }

    return {
      success: true,
      status: response.status,
      data: dashboard,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};

export const getTutorAvailabilityMe = async (): Promise<
  TutorActionResult<TutorAvailabilitySlot[]>
> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
      };
    }

    const authResult = await getAuthHeaders();
    if (!authResult.success || !authResult.data) {
      return {
        success: false,
        message: authResult.message || "Unauthorized. Please log in first.",
      };
    }

    const response = await fetch(`${baseUrl}/api/tutors/availability/me`, {
      method: "GET",
      headers: authResult.data,
      cache: "no-store",
    });

    const raw = await response.text();
    const parsed = parseResponseBody(raw);
    const slots = extractAvailabilitySlots(parsed);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: getMessage(parsed) || `Failed to fetch availability (status ${response.status}).`,
      };
    }

    return {
      success: true,
      status: response.status,
      data: slots,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};

export const addTutorAvailabilitySlot = async (
  payload: TutorAvailabilityInput
): Promise<TutorActionResult<TutorAvailabilitySlot>> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
      };
    }

    const normalized = normalizeAvailabilityRow(payload);
    if (!normalized.success || !normalized.data) {
      return {
        success: false,
        message: normalized.message || "Invalid availability payload.",
      };
    }

    const authResult = await getAuthHeaders();
    if (!authResult.success || !authResult.data) {
      return {
        success: false,
        message: authResult.message || "Unauthorized. Please log in first.",
      };
    }

    const attemptBodies: unknown[] = [
      normalized.data,
      { availability: [normalized.data] },
    ];
    let lastFailure: { status?: number; message: string } | null = null;

    for (const attemptBody of attemptBodies) {
      const response = await fetch(`${baseUrl}/api/tutors/availability`, {
        method: "POST",
        headers: authResult.data,
        body: JSON.stringify(attemptBody),
        cache: "no-store",
      });

      const raw = await response.text();
      const parsed = parseResponseBody(raw);
      const message =
        getMessage(parsed) || `Failed to add availability slot (status ${response.status}).`;

      if (response.ok) {
        const [createdSlot] = extractAvailabilitySlots(parsed);
        return {
          success: true,
          status: response.status,
          message: getMessage(parsed) || "Availability slot added successfully.",
          data: createdSlot,
        };
      }

      lastFailure = {
        status: response.status,
        message,
      };

      const isShapeError = /availability\s*day.*string/i.test(message);
      if (!isShapeError) {
        break;
      }
    }

    return {
      success: false,
      status: lastFailure?.status,
      message: lastFailure?.message || "Failed to add availability slot.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};

export const updateTutorAvailabilitySlot = async (
  slotId: string,
  payload: TutorAvailabilityPatchPayload
): Promise<TutorActionResult<TutorAvailabilitySlot>> => {
  try {
    const trimmedSlotId = slotId.trim();
    if (!trimmedSlotId) {
      return {
        success: false,
        message: "Availability slot id is required.",
      };
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
      };
    }

    const normalized = normalizeAvailabilityPatchPayload(payload);
    if (!normalized.success || !normalized.data) {
      return {
        success: false,
        message: normalized.message || "Invalid availability update payload.",
      };
    }

    const authResult = await getAuthHeaders();
    if (!authResult.success || !authResult.data) {
      return {
        success: false,
        message: authResult.message || "Unauthorized. Please log in first.",
      };
    }

    const response = await fetch(
      `${baseUrl}/api/tutors/availability/${encodeURIComponent(trimmedSlotId)}`,
      {
        method: "PATCH",
        headers: authResult.data,
        body: JSON.stringify(normalized.data),
        cache: "no-store",
      }
    );

    const raw = await response.text();
    const parsed = parseResponseBody(raw);
    const message =
      getMessage(parsed) || `Failed to update availability slot (status ${response.status}).`;

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message,
      };
    }

    const [updatedSlot] = extractAvailabilitySlots(parsed);
    return {
      success: true,
      status: response.status,
      message: getMessage(parsed) || "Availability slot updated successfully.",
      data: updatedSlot,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};

export const removeTutorAvailabilitySlot = async (
  slotId: string
): Promise<TutorActionResult> => {
  try {
    const trimmedSlotId = slotId.trim();
    if (!trimmedSlotId) {
      return {
        success: false,
        message: "Availability slot id is required.",
      };
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
      };
    }

    const authResult = await getAuthHeaders();
    if (!authResult.success || !authResult.data) {
      return {
        success: false,
        message: authResult.message || "Unauthorized. Please log in first.",
      };
    }

    const response = await fetch(
      `${baseUrl}/api/tutors/availability/${encodeURIComponent(trimmedSlotId)}`,
      {
        method: "DELETE",
        headers: authResult.data,
        cache: "no-store",
      }
    );

    const raw = await response.text();
    const parsed = parseResponseBody(raw);
    const message =
      getMessage(parsed) || `Failed to remove availability slot (status ${response.status}).`;

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message,
      };
    }

    return {
      success: true,
      status: response.status,
      message: getMessage(parsed) || "Availability slot removed successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};

export const updateTutorProfile = async (
  payload: TutorProfileUpdatePayload
): Promise<TutorActionResult<TutorDashboardData>> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
      };
    }

    const normalized = normalizeTutorProfilePayload(payload);
    if (!normalized.success || !normalized.data) {
      return {
        success: false,
        message: normalized.message || "Invalid tutor profile payload.",
      };
    }

    const authResult = await getAuthHeaders();
    if (!authResult.success || !authResult.data) {
      return {
        success: false,
        message: authResult.message || "Unauthorized. Please log in first.",
      };
    }

    const response = await fetch(`${baseUrl}/api/tutors/profile`, {
      method: "PATCH",
      headers: authResult.data,
      body: JSON.stringify(normalized.data),
      cache: "no-store",
    });

    const raw = await response.text();
    const parsed = parseResponseBody(raw);
    const dashboard = extractTutorDashboard(parsed);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: getMessage(parsed) || `Failed to update tutor profile (status ${response.status}).`,
      };
    }

    return {
      success: true,
      status: response.status,
      message: getMessage(parsed) || "Tutor profile updated successfully.",
      data: dashboard,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};

export const updateTutorAvailability = async (
  payload: TutorAvailabilityUpdatePayload
): Promise<TutorActionResult<TutorDashboardData>> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
      };
    }

    const normalized = normalizeAvailabilityPayload(payload);
    if (!normalized.success || !normalized.data) {
      return {
        success: false,
        message: normalized.message || "Invalid availability payload.",
      };
    }

    const authResult = await getAuthHeaders();
    if (!authResult.success || !authResult.data) {
      return {
        success: false,
        message: authResult.message || "Unauthorized. Please log in first.",
      };
    }

    const normalizedSlots = normalized.data.availability.map((slot) => ({
      day: String(slot.day).trim(),
      startTime: String(slot.startTime).trim(),
      endTime: String(slot.endTime).trim(),
    }));

    const attemptBodies: unknown[] = [
      { availability: normalizedSlots },
      {
        availability: normalizedSlots.map((slot) => ({
          ...slot,
          day: slot.day.toLowerCase(),
        })),
      },
      normalizedSlots,
    ];

    let lastFailure: AvailabilityAttemptResult | null = null;

    for (let index = 0; index < attemptBodies.length; index += 1) {
      const attempt = await sendAvailabilityRequest(baseUrl, authResult.data, attemptBodies[index]);

      if (attempt.ok) {
        return {
          success: true,
          status: attempt.status,
          message: "Availability updated successfully.",
          data: attempt.dashboard,
        };
      }

      lastFailure = attempt;

      const isDayValidationError = /availability\s*day.*string/i.test(attempt.message);
      if (!isDayValidationError) {
        break;
      }
    }

    return {
      success: false,
      status: lastFailure?.status,
      message: lastFailure?.message || "Failed to update availability.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};

export const updateTutorAndUserProfile = async (
  payload: TutorCombinedProfileUpdatePayload
): Promise<TutorActionResult<TutorCombinedProfileUpdateResult>> => {
  const userPayload: Record<string, unknown> = {};
  const tutorPayload: Record<string, unknown> = {};

  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    userPayload.name = payload.name;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "image")) {
    userPayload.image = payload.image;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "bio")) {
    tutorPayload.bio = payload.bio;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "pricePerHr")) {
    tutorPayload.pricePerHr = payload.pricePerHr;
  }

  const shouldUpdateUser = Object.keys(userPayload).length > 0;
  const shouldUpdateTutor = Object.keys(tutorPayload).length > 0;

  if (!shouldUpdateUser && !shouldUpdateTutor) {
    return {
      success: false,
      message: "No changes were provided.",
    };
  }

  let updatedUser: UserProfile | undefined;
  let updatedTutor: TutorDashboardData | undefined;
  let userError = "";
  let tutorError = "";

  if (shouldUpdateUser) {
    const userResult = await updateMyProfile(userPayload as UpdateProfilePayload);
    if (userResult.success && userResult.data) {
      updatedUser = userResult.data;
    } else {
      userError = userResult.message || "User profile update failed.";
    }
  }

  if (shouldUpdateTutor) {
    const tutorResult = await updateTutorProfile(tutorPayload as TutorProfileUpdatePayload);
    if (tutorResult.success && tutorResult.data) {
      updatedTutor = tutorResult.data;
    } else if (tutorResult.success) {
      // Endpoint may return only success/message without full tutor object.
      updatedTutor = undefined;
    } else {
      tutorError = tutorResult.message || "Tutor profile update failed.";
    }
  }

  const updatedUserFlag = Boolean(updatedUser) || (shouldUpdateUser && !userError);
  const updatedTutorFlag = Boolean(updatedTutor) || (shouldUpdateTutor && !tutorError);

  if (userError || tutorError) {
    return {
      success: false,
      message: [userError, tutorError].filter(Boolean).join(" "),
      data: {
        user: updatedUser,
        tutor: updatedTutor,
        updatedUser: updatedUserFlag,
        updatedTutor: updatedTutorFlag,
      },
    };
  }

  return {
    success: true,
    message: "Profile updated successfully.",
    data: {
      user: updatedUser,
      tutor: updatedTutor,
      updatedUser: updatedUserFlag,
      updatedTutor: updatedTutorFlag,
    },
  };
};
