"use server"

interface TutorFilters {
    category?: string;
    price?: string | number;
    rating?: string | number;
}

export const getAllTutors = async (filters?: TutorFilters) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters?.category) {
            queryParams.append("category", filters.category);
        }
        if (filters?.price) {
            queryParams.append("price", filters.price.toString());
        }
        if (filters?.rating) {
            queryParams.append("rating", filters.rating.toString());
        }

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tutors${queryString}`, {
            cache: 'no-store' // Ensure we get fresh data when filtering
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching tutors", error);
        return [];
    }
}
