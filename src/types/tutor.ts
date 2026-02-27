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
}
