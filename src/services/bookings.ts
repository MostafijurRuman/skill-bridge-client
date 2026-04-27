"use server";

import { cookies } from "next/headers";

interface BookSessionPayload {
  tutorId: string;
  sessionDate: string;
}

type BookingActionResult<T = unknown> = {
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

export const createBooking = async (
  payload: BookSessionPayload
): Promise<BookingActionResult> => {
  try {
    if (!payload?.tutorId || !payload?.sessionDate) {
      return {
        success: false,
        message: "tutorId and sessionDate are required.",
      };
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message:
          "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
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

    // Important: send Bearer only (do not send full Cookie header with it)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      // Fallback to backend session cookie only when token is not available
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

    const response = await fetch(`${baseUrl}/api/bookings`, {
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
        message:
          data?.message || `Failed to create booking (status ${response.status}).`,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMyBookings = async (): Promise<BookingActionResult<any[]>> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message:
          "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
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

    // Important: send Bearer only (do not send full Cookie header with it)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      // Fallback to backend session cookie only when token is not available
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

    const response = await fetch(`${baseUrl}/api/bookings`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const raw = await response.text();
    const data = parseResponseBody(raw);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message:
          data?.message || `Failed to fetch bookings (status ${response.status}).`,
        data: [],
      };
    }

    return {
      success: true,
      status: response.status,
      data: Array.isArray(data) ? data : data.data || [],
    };
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      success: false,
      message: error?.message || "Unexpected server error.",
      data: [],
    };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getBookingById = async (bookingId: string): Promise<BookingActionResult<any>> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message:
          "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
      };
    }

    if (!bookingId) {
      return {
        success: false,
        message: "Booking ID is required.",
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

    const response = await fetch(`${baseUrl}/api/bookings/${bookingId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const raw = await response.text();
    const data = parseResponseBody(raw);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message:
          data?.message || `Failed to fetch booking (status ${response.status}).`,
        data,
      };
    }

    return {
      success: true,
      status: response.status,
      data: data?.data || data,
    };
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      success: false,
      message: error?.message || "Unexpected server error.",
    };
  }
};

export const cancelBooking = async (
  bookingId: string
): Promise<BookingActionResult> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message:
          "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
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

    const response = await fetch(`${baseUrl}/api/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers,
      cache: "no-store",
    });

    const raw = await response.text();
    const data = parseResponseBody(raw);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message:
          data?.message || `Failed to cancel booking (status ${response.status}).`,
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

export const completeBooking = async (
  bookingId: string
): Promise<BookingActionResult> => {
  try {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return {
        success: false,
        message:
          "Server config error: BACKEND_URL or NEXT_PUBLIC_BASE_URL is missing.",
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

    const response = await fetch(`${baseUrl}/api/bookings/${bookingId}/complete`, {
      method: "PATCH",
      headers,
      cache: "no-store",
    });

    const raw = await response.text();
    const data = parseResponseBody(raw);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message:
          data?.message || `Failed to complete booking (status ${response.status}).`,
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

