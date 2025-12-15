import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getAllEvents = async () => {
    const { data } = await instance.get("/events");
    return data;
};

export const createEvent = async (eventData) => {
    const { data } = await instance.post("/events", eventData);
    return data;
};

export const updateEvent = async (eventId, eventData) => {
    const { data } = await instance.put(`/events/${eventId}`, eventData);
    return data;
};

export const deleteEvent = async (eventId) => {
    await instance.delete(`/events/${eventId}`);
    return true;
};