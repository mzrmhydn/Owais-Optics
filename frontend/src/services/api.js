import axios from 'axios';

// Base API URL - update this when backend is ready
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with defaults
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
);

// Reviews API
export const reviewsAPI = {
    // Get all reviews
    getAll: async (page = 1, limit = 20) => {
        try {
            const response = await api.get('/reviews', { params: { page, limit } });
            return response.reviews || response;
        } catch (error) {
            console.warn('Using mock data - backend not connected');
            return [];
        }
    },

    // Get review stats (average rating, total count)
    getStats: async () => {
        try {
            const response = await api.get('/reviews/stats');
            return response;
        } catch (error) {
            console.warn('Using mock stats - backend not connected');
            return { averageRating: 0, totalReviews: 0 };
        }
    },

    // Create a new review
    create: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response;
    },

    // Update an existing review by user_id
    update: async (userId, reviewData) => {
        const response = await api.put(`/reviews/user/${userId}`, reviewData);
        return response;
    },
};

// Auth API
export const authAPI = {
    // Email/Password signup
    signup: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        return response;
    },

    // Email/Password login
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.token) {
            localStorage.setItem('authToken', response.token);
        }
        return response;
    },

    // Get Google OAuth URL
    getGoogleAuthUrl: () => {
        return `${API_BASE_URL}/auth/google`;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('authToken');
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response;
        } catch (error) {
            return null;
        }
    },
};

export default api;
