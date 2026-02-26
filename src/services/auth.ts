const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const loginUser = async (credentials: Record<string, string>) => {
    const response = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            throw { response: { data: { message: `Login failed with status: ${response.status}` } } };
        }
        throw { response: { data: errorData } };
    }

    return response.json();
};
