const API_BASE_URL = "http://localhost:3000/api";

async function apiRequest(url, options = {}) {
    const token = localStorage.getItem("token");
    const requestUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

    const response = await fetch(requestUrl, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../index.html";
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            "Une erreur est survenue."
        );
    }

    return data;
}

function extractCollection(response, key) {
    if (Array.isArray(response)) {
        return response;
    }

    return Array.isArray(response?.[key]) ? response[key] : [];
}