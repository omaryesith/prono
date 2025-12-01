// API Configuration - uses environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/projects';

export const config = {
    apiUrl: API_URL,
    wsUrl: WS_URL,
};
