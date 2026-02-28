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

export const createReview = async (payload: { bookingId: string; rating: number; comment: string }): Promise<ReviewActionResult> => {
    try {
        if (!payload?.bookingId || typeof payload.bookingId !== "string") {
            return {
                success: false,
                message: "bookingId is required.",
            };
        }

        const baseUrl = getBaseUrl();
        if (!baseUrl) {
            return {
                success: false,
                message: "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
            };
        }

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
        } else {
            const secureSession = cookieStore.get("__Secure-better-auth.session_token")?.value;
            const normalSession = cookieStore.get("better-auth.session_token")?.value;

            if (secureSession) {
                headers.set("Cookie", `__Secure-better-auth.session_token=${secureSession}`);
            } else if (normalSession) {
                headers.set("Cookie", `better-auth.session_token=${normalSession}`);
            } else {
                return {
                    success: false,
                    message: "Unauthorized. Please log in first.",
                };
            }
        }

        const response = await fetch(`${baseUrl}/api/reviews`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
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
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        return {
            success: false,
            message: error?.message || "Unexpected server error.",
        };
    }
};
