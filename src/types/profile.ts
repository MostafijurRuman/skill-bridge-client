export interface UserProfile {
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

export interface UpdateProfilePayload {
  name?: string;
  image?: string | null;
}
