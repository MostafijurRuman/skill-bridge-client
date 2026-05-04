export interface SearchResultItem {
    id: string;
    name: string;
    image?: string | null;
    rating?: number;
}

export interface SearchResults {
    subjects: SearchResultItem[];
    tutors: SearchResultItem[];
    categories: SearchResultItem[];
}

export const getGlobalSearch = async (query: string): Promise<SearchResults> => {
    try {
        if (!query.trim()) {
            return { subjects: [], tutors: [], categories: [] };
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data = await response.json();
        return data as SearchResults;
    } catch (error) {
        console.error("Error performing search", error);
        return { subjects: [], tutors: [], categories: [] };
    }
};
