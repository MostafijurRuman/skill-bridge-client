"use server";

import { cookies } from "next/headers";
import type { AdminBooking, AdminCategory, AdminUser } from "@/types/admin";

type AdminActionResult<T = unknown> = {
  success: boolean;
  status?: number;
  message?: string;
  data?: T;
};

const getBaseUrl = () =>
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

const parseResponseBody = (raw: string): unknown => {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { message: raw };
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toRecordArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => isRecord(item))
    : [];

const pickFirstString = (source: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const unwrapCollection = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return toRecordArray(payload);
  if (!isRecord(payload)) return [];

  const candidateKeys = ["data", "items", "results", "bookings", "users", "categories"];
  for (const key of candidateKeys) {
    if (Array.isArray(payload[key])) {
      return toRecordArray(payload[key]);
    }
  }

  if (isRecord(payload.data)) {
    for (const key of candidateKeys) {
      if (Array.isArray(payload.data[key])) {
        return toRecordArray(payload.data[key]);
      }
    }
  }

  return [];
};

const getMessage = (payload: unknown): string | undefined => {
  if (!isRecord(payload)) return undefined;
  const direct = pickFirstString(payload, ["message", "error", "detail"]);
  if (direct) return direct;

  if (isRecord(payload.data)) {
    const nested = pickFirstString(payload.data, ["message", "error", "detail"]);
    if (nested) return nested;
  }

  return undefined;
};

const parseAdminUser = (input: Record<string, unknown>): AdminUser | null => {
  const id = pickFirstString(input, ["id", "_id", "userId"]);
  if (!id) return null;

  const nestedUser = isRecord(input.user) ? input.user : undefined;
  const name =
    pickFirstString(input, ["name"]) ||
    (nestedUser ? pickFirstString(nestedUser, ["name"]) : "");
  const email =
    pickFirstString(input, ["email"]) ||
    (nestedUser ? pickFirstString(nestedUser, ["email"]) : "");
  const image =
    pickFirstString(input, ["image", "avatar"]) ||
    (nestedUser ? pickFirstString(nestedUser, ["image", "avatar"]) : "");
  const role =
    pickFirstString(input, ["role"]) ||
    (nestedUser ? pickFirstString(nestedUser, ["role"]) : "STUDENT");
  const createdAt =
    pickFirstString(input, ["createdAt"]) ||
    (nestedUser ? pickFirstString(nestedUser, ["createdAt"]) : "");
  const updatedAt =
    pickFirstString(input, ["updatedAt"]) ||
    (nestedUser ? pickFirstString(nestedUser, ["updatedAt"]) : "");

  return {
    id,
    name,
    email,
    image: image || null,
    role: role || "STUDENT",
    isBanned:
      toBoolean(input.isBanned) ||
      (nestedUser ? toBoolean(nestedUser.isBanned) : false),
    emailVerified:
      toBoolean(input.emailVerified) ||
      (nestedUser ? toBoolean(nestedUser.emailVerified) : false),
    createdAt,
    updatedAt,
  };
};

const parseAdminBooking = (input: Record<string, unknown>): AdminBooking | null => {
  const id = pickFirstString(input, ["id", "_id", "bookingId"]);
  if (!id) return null;

  const student = isRecord(input.student) ? input.student : undefined;
  const tutor = isRecord(input.tutor) ? input.tutor : undefined;
  const studentUser = student && isRecord(student.user) ? student.user : undefined;
  const tutorUser = tutor && isRecord(tutor.user) ? tutor.user : undefined;

  const studentId =
    pickFirstString(input, ["studentId"]) ||
    (student ? pickFirstString(student, ["id", "userId"]) : "");
  const tutorId =
    pickFirstString(input, ["tutorId"]) ||
    (tutor ? pickFirstString(tutor, ["id", "userId"]) : "");

  let categoryName = "";
  if (tutor) {
    if (Array.isArray(tutor.categories) && tutor.categories.length > 0) {
      const firstCategory = tutor.categories[0];
      if (isRecord(firstCategory)) {
        categoryName = pickFirstString(firstCategory, ["name", "title"]);
      }
    }

    if (!categoryName && isRecord(tutor.category)) {
      categoryName = pickFirstString(tutor.category, ["name", "title"]);
    }
  }

  return {
    id,
    studentId,
    tutorId,
    studentName:
      pickFirstString(input, ["studentName"]) ||
      (studentUser ? pickFirstString(studentUser, ["name"]) : "") ||
      (student ? pickFirstString(student, ["name"]) : ""),
    tutorName:
      pickFirstString(input, ["tutorName"]) ||
      (tutorUser ? pickFirstString(tutorUser, ["name"]) : "") ||
      (tutor ? pickFirstString(tutor, ["name"]) : ""),
    categoryName,
    sessionDate: pickFirstString(input, ["sessionDate", "date", "startTime"]),
    status: pickFirstString(input, ["status"]).toUpperCase() || "PENDING",
    createdAt: pickFirstString(input, ["createdAt", "updatedAt"]),
  };
};

const parseAdminCategory = (input: Record<string, unknown>): AdminCategory | null => {
  const name = pickFirstString(input, ["name", "title"]);
  const id = pickFirstString(input, ["id", "_id"]) || name;
  if (!id || !name) return null;

  return {
    id,
    name,
  };
};

const getAuthHeaders = async (): Promise<AdminActionResult<Headers>> => {
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

export const getAdminUsers = async (): Promise<AdminActionResult<AdminUser[]>> => {
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

    const response = await fetch(`${baseUrl}/api/admin/users`, {
      method: "GET",
      headers: authResult.data,
      cache: "no-store",
    });

    const raw = await response.text();
    const parsed = parseResponseBody(raw);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: getMessage(parsed) || `Failed to fetch users (status ${response.status}).`,
        data: [],
      };
    }

    const users = unwrapCollection(parsed)
      .map(parseAdminUser)
      .filter((item): item is AdminUser => Boolean(item));

    return {
      success: true,
      status: response.status,
      data: users,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
      data: [],
    };
  }
};

export const getAdminBookings = async (): Promise<AdminActionResult<AdminBooking[]>> => {
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

    const response = await fetch(`${baseUrl}/api/admin/bookings`, {
      method: "GET",
      headers: authResult.data,
      cache: "no-store",
    });

    const raw = await response.text();
    const parsed = parseResponseBody(raw);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message:
          getMessage(parsed) || `Failed to fetch bookings (status ${response.status}).`,
        data: [],
      };
    }

    const bookings = unwrapCollection(parsed)
      .map(parseAdminBooking)
      .filter((item): item is AdminBooking => Boolean(item));

    return {
      success: true,
      status: response.status,
      data: bookings,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
      data: [],
    };
  }
};

export const getAdminCategories = async (): Promise<AdminActionResult<AdminCategory[]>> => {
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

    const response = await fetch(`${baseUrl}/api/admin/categories`, {
      method: "GET",
      headers: authResult.data,
      cache: "no-store",
    });

    const raw = await response.text();
    const parsed = parseResponseBody(raw);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message:
          getMessage(parsed) || `Failed to fetch categories (status ${response.status}).`,
        data: [],
      };
    }

    const categories = unwrapCollection(parsed)
      .map(parseAdminCategory)
      .filter((item): item is AdminCategory => Boolean(item));

    return {
      success: true,
      status: response.status,
      data: categories,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
      data: [],
    };
  }
};

export const updateAdminUserStatus = async (
  userId: string,
  isBanned: boolean
): Promise<AdminActionResult<AdminUser>> => {
  try {
    const normalizedUserId = typeof userId === "string" ? userId.trim() : "";
    if (!normalizedUserId) {
      return {
        success: false,
        message: "A valid user ID is required.",
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
      `${baseUrl}/api/admin/users/${encodeURIComponent(normalizedUserId)}`,
      {
        method: "PATCH",
        headers: authResult.data,
        body: JSON.stringify({ isBanned }),
        cache: "no-store",
      }
    );

    const raw = await response.text();
    const parsed = parseResponseBody(raw);
    const payloadRecord = isRecord(parsed) ? parsed : undefined;
    const updatedUser = parseAdminUser(
      isRecord(payloadRecord?.data) ? payloadRecord.data : payloadRecord || {}
    );

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message:
          getMessage(parsed) || `Failed to update user status (status ${response.status}).`,
      };
    }

    return {
      success: true,
      status: response.status,
      message:
        getMessage(parsed) ||
        `User has been ${isBanned ? "banned" : "unbanned"} successfully.`,
      data: updatedUser || undefined,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};
