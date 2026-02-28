import type { UpdateProfilePayload, UserProfile } from "@/types/profile";

export type TutorBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export interface TutorBooking {
  id: string;
  studentId: string;
  tutorId: string;
  sessionDate: string;
  status: TutorBookingStatus;
  createdAt: string;
}

export interface TutorReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  studentId: string;
  tutorId: string;
}

export interface TutorAvailabilitySlot {
  id: string;
  tutorId: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface TutorCategory {
  id: string;
  name: string;
}

export interface TutorDashboardData {
  id: string;
  userId: string;
  bio: string;
  pricePerHr: number;
  rating: number;
  bookings: TutorBooking[];
  reviews: TutorReview[];
  availability: TutorAvailabilitySlot[];
  categories: TutorCategory[];
}

export interface TutorProfileUpdatePayload {
  bio?: string;
  pricePerHr?: number;
}

export interface TutorAvailabilityInput {
  day: string;
  startTime: string;
  endTime: string;
}

export interface TutorAvailabilityUpdatePayload {
  availability: TutorAvailabilityInput[];
}

export interface TutorAvailabilityPatchPayload {
  day?: string;
  startTime?: string;
  endTime?: string;
}

export interface TutorCombinedProfileUpdatePayload extends UpdateProfilePayload {
  bio?: string;
  pricePerHr?: number;
}

export interface TutorCombinedProfileUpdateResult {
  user?: UserProfile;
  tutor?: TutorDashboardData;
  updatedUser: boolean;
  updatedTutor: boolean;
}
