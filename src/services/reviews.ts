"use server";

import { cookies } from "next/headers";

type ReviewActionResult<T = unknown> = {
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
        return JSON.parse(raw);
    } catch {
        return { message: raw };
    }
};

const getAuthHeaders = async (): Promise<ReviewActionResult<Headers>> => {
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

export const createReview = async (payload: { tutorId: string; rating: number; comment: string }): Promise<ReviewActionResult> => {
    try {
        if (!payload?.tutorId || typeof payload.tutorId !== "string") {
            return {
                success: false,
                message: "tutorId is required.",
            };
        }

        const normalizedRating = Number(payload.rating);
        if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
            return {
                success: false,
                message: "rating must be a number between 1 and 5.",
            };
        }

        const normalizedComment = typeof payload.comment === "string" ? payload.comment.trim() : "";
        if (!normalizedComment) {
            return {
                success: false,
                message: "comment is required.",
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

        const response = await fetch(`${baseUrl}/api/reviews`, {
            method: "POST",
            headers: authResult.data,
            body: JSON.stringify({
                tutorId: payload.tutorId,
                rating: normalizedRating,
                comment: normalizedComment,
            }),
            cache: "no-store",
        });

        const raw = await response.text();
        const data = parseResponseBody(raw);

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: data?.message || `Failed to create review (status ${response.status}).`,
                data,
            };
        }

        return {
            success: true,
            status: response.status,
            data,
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unexpected server error.",
        };
    }
};

export const getReviewByBookingId = async (
    bookingId: string
): Promise<ReviewActionResult<unknown | null>> => {
    try {
        const normalizedBookingId = typeof bookingId === "string" ? bookingId.trim() : "";
        if (!normalizedBookingId) {
            return {
                success: false,
                message: "bookingId is required.",
                data: null,
            };
        }

        const baseUrl = getBaseUrl();
        if (!baseUrl) {
            return {
                success: false,
                message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
                data: null,
            };
        }

        const authResult = await getAuthHeaders();
        if (!authResult.success || !authResult.data) {
            return {
                success: false,
                message: authResult.message || "Unauthorized. Please log in first.",
                data: null,
            };
        }

        const response = await fetch(`${baseUrl}/api/reviews/booking/${encodeURIComponent(normalizedBookingId)}`, {
            method: "GET",
            headers: authResult.data,
            cache: "no-store",
        });

        const raw = await response.text();
        const data = parseResponseBody(raw);

        if (response.status === 404) {
            return {
                success: true,
                status: response.status,
                data: null,
            };
        }

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: (data as { message?: string })?.message || `Failed to fetch review (status ${response.status}).`,
                data: null,
            };
        }

        const reviewPayload =
            (data as { data?: unknown })?.data !== undefined
                ? (data as { data?: unknown }).data
                : data;

        return {
            success: true,
            status: response.status,
            data: reviewPayload || null,
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unexpected server error.",
            data: null,
        };
    }
};

export const getReviewsByTutorId = async (
    tutorId: string
): Promise<ReviewActionResult<unknown[]>> => {
    try {
        const normalizedTutorId = typeof tutorId === "string" ? tutorId.trim() : "";
        if (!normalizedTutorId) {
            return {
                success: false,
                message: "tutorId is required.",
                data: [],
            };
        }

        const baseUrl = getBaseUrl();
        if (!baseUrl) {
            return {
                success: false,
                message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
                data: [],
            };
        }

        const authResult = await getAuthHeaders();
        if (!authResult.success || !authResult.data) {
            return {
                success: false,
                message: authResult.message || "Unauthorized. Please log in first.",
                data: [],
            };
        }

        const response = await fetch(`${baseUrl}/api/reviews/tutor/${encodeURIComponent(normalizedTutorId)}`, {
            method: "GET",
            headers: authResult.data,
            cache: "no-store",
        });

        const raw = await response.text();
        const data = parseResponseBody(raw);

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: (data as { message?: string })?.message || `Failed to fetch tutor reviews (status ${response.status}).`,
                data: [],
            };
        }

        const reviewPayload = (data as { data?: unknown })?.data;
        const list = Array.isArray(reviewPayload)
            ? reviewPayload
            : Array.isArray(data)
                ? data
                : [];

        return {
            success: true,
            status: response.status,
            data: list,
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unexpected server error.",
            data: [],
        };
    }
};
