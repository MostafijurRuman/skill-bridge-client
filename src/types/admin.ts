export interface AdminUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isBanned: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBooking {
  id: string;
  studentId: string;
  tutorId: string;
  studentName: string;
  tutorName: string;
  categoryName: string;
  sessionDate: string;
  status: string;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
}
