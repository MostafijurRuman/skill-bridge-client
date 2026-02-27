export interface TutorType {
    id: string;
    userId: string;
    bio: string;
    pricePerHr: number;
    rating: number;
    user: {
        id: string;
        name: string;
        email: string;
        password: null | string;
        role: "TUTOR" | string;
        isBanned: boolean;
        bannedAt: null | string;
        emailVerified: boolean;
        image: null | string;
        createdAt: string;
        updatedAt: string;
    };
    categories: {
        id: string;
        name: string;
    }[];
    availability?: {
        id: string;
        tutorId: string;
        day: string;
        startTime: string;
        endTime: string;
    }[];
    reviews?: {
        id: string;
        tutorId: string;
        studentId: string;
        rating: number;
        comment: string;
        createdAt: string;
    }[];
}
