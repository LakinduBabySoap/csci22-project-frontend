import axios from "axios";

// 1. Create the Axios instance with your base URL
const instance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_API_URL, // e.g., http://localhost:3000/api
});

// 2. Automatically add the token to every request
instance.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// 3. Use the 'instance' for your requests
export const getVenueComments = async (venueId) => {
    // This sends a GET to: http://localhost:3000/api/comments/:venueId
    const { data } = await instance.get(`/comments/${venueId}`);
    return data;
};

export const addVenueComment = async (venueId, text) => {
    // This sends a POST to: http://localhost:3000/api/comments/:venueId
    // The interceptor above automatically adds the Authorization header
    const { data } = await instance.post(`/comments/${venueId}`, { text });
    return data;
};