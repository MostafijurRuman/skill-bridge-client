"use server";

import { cookies } from "next/headers";
import type { UpdateProfilePayload, UserProfile } from "@/types/profile";

type ProfileActionResult<T = unknown> = {
  success: boolean;
  status?: number;
  message?: string;
  data?: T;
};

const getBaseUrl = () =>
  process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BASE_URL || "";

const parseResponseBody = (raw: string) => {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return { message: raw };
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractProfile = (payload: unknown): UserProfile | undefined => {
  if (!isRecord(payload)) return undefined;

  const source =
    isRecord(payload.data) && !Array.isArray(payload.data)
      ? payload.data
      : payload;

  const id = typeof source.id === "string" ? source.id : "";
  const email = typeof source.email === "string" ? source.email : "";

  if (!id || !email) return undefined;

  return {
    id,
    name: typeof source.name === "string" ? source.name : "",
    email,
    image: typeof source.image === "string" ? source.image : null,
    role: typeof source.role === "string" ? source.role : "STUDENT",
    isBanned: Boolean(source.isBanned),
    emailVerified: Boolean(source.emailVerified),
    createdAt: typeof source.createdAt === "string" ? source.createdAt : "",
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : "",
  };
};

const getAuthHeaders = async (): Promise<ProfileActionResult<Headers>> => {
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
    return {
      success: true,
      data: headers,
    };
  }

  const secureSession = cookieStore.get("__Secure-better-auth.session_token")?.value;
  const normalSession = cookieStore.get("better-auth.session_token")?.value;

  if (secureSession) {
    headers.set("Cookie", `__Secure-better-auth.session_token=${secureSession}`);
    return {
      success: true,
      data: headers,
    };
  }

  if (normalSession) {
    headers.set("Cookie", `better-auth.session_token=${normalSession}`);
    return {
      success: true,
      data: headers,
    };
  }

  return {
    success: false,
    message: "Unauthorized. Please log in first.",
  };
};

export const getMyProfile = async (): Promise<ProfileActionResult<UserProfile>> => {
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

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: "GET",
      headers: authResult.data,
      cache: "no-store",
    });

    const raw = await response.text();
    const parsed = parseResponseBody(raw);
    const profile = extractProfile(parsed);
    const parsedRecord = isRecord(parsed) ? parsed : undefined;

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message:
          (parsedRecord && typeof parsedRecord.message === "string"
            ? parsedRecord.message
            : undefined) || `Failed to fetch profile (status ${response.status}).`,
      };
    }

    if (!profile) {
      return {
        success: false,
        status: response.status,
        message: "Profile response is missing required fields.",
      };
    }

    return {
      success: true,
      status: response.status,
      data: profile,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};

const normalizeUpdatePayload = (
  payload: UpdateProfilePayload
): ProfileActionResult<UpdateProfilePayload> => {
  const normalized: UpdateProfilePayload = {};

  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    if (typeof payload.name !== "string") {
      return {
        success: false,
        message: "Name must be a string.",
      };
    }

    const trimmedName = payload.name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
      return {
        success: false,
        message: "Name must be between 2 and 60 characters.",
      };
    }

    normalized.name = trimmedName;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "image")) {
    if (payload.image === null) {
      normalized.image = null;
    } else if (typeof payload.image === "string") {
      const trimmedImage = payload.image.trim();
      if (!trimmedImage) {
        return {
          success: false,
          message: "Image must be a non-empty string or null.",
        };
      }
      normalized.image = trimmedImage;
    } else {
      return {
        success: false,
        message: "Image must be a string or null.",
      };
    }
  }

  if (Object.keys(normalized).length === 0) {
    return {
      success: false,
      message: "No valid fields provided for update.",
    };
  }

  return {
    success: true,
    data: normalized,
  };
};

export const updateMyProfile = async (
  payload: UpdateProfilePayload
): Promise<ProfileActionResult<UserProfile>> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
      };
    }

    const normalized = normalizeUpdatePayload(payload);
    if (!normalized.success || !normalized.data) {
      return {
        success: false,
        message: normalized.message || "Invalid profile payload.",
      };
    }

    const authResult = await getAuthHeaders();
    if (!authResult.success || !authResult.data) {
      return {
        success: false,
        message: authResult.message || "Unauthorized. Please log in first.",
      };
    }

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: authResult.data,
      body: JSON.stringify(normalized.data),
      cache: "no-store",
    });

    const raw = await response.text();
    const parsed = parseResponseBody(raw);
    const profile = extractProfile(parsed);
    const parsedRecord = isRecord(parsed) ? parsed : undefined;

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message:
          (parsedRecord && typeof parsedRecord.message === "string"
            ? parsedRecord.message
            : undefined) || `Failed to update profile (status ${response.status}).`,
      };
    }

    if (!profile) {
      return {
        success: false,
        status: response.status,
        message: "Profile update response is missing required fields.",
      };
    }

    return {
      success: true,
      status: response.status,
      message:
        (parsedRecord && typeof parsedRecord.message === "string"
          ? parsedRecord.message
          : undefined) || "Profile updated successfully.",
      data: profile,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected server error.",
    };
  }
};
