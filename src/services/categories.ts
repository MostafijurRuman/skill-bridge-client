"use server"

export interface Category {
    id: string;
    name: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
    try {
        // Fallback endpoint if admin/categories fails or is the primary
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/api/admin/categories`, {
            next: { revalidate: 3600 }
        });

        const json = await response.json();

        if (json.success && Array.isArray(json.data)) {
            return json.data;
        } else if (Array.isArray(json)) {
            return json;
        }
        return [];
    } catch (error) {
        console.error("Error fetching categories", error);
        return [];
    }
}
