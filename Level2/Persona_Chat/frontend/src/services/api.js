const API_BASE_URL = 'http://localhost:8000/api';

export const fetchPersonas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/personas`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch personas:", error);
        return [];
    }
};

export const sendChatMessage = async (personaId, history) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ personaId, history }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to send chat message:", error);
        return { response: "Sorry, I couldn't connect to the server." };
    }
};