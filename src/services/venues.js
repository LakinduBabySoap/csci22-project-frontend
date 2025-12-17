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

export const getAllVenues = async () => {
	const { data } = await instance.get("/venues");
	return data;
};

export const getVenueById = async (venueId) => {
	const { data } = await instance.get(`/venues/${venueId}`);
	return data;
};

// For favorites
export const addFavoriteVenue = async (venueId) => {
	const { data } = await instance.post(`/users/favorites/${venueId}`);
	return data;
};

export const removeFavoriteVenue = async (venueId) => {
	const { data } = await instance.delete(`/users/favorites/${venueId}`);
	return data;
};

export const getFavoriteVenues = async () => {
	const { data } = await instance.get("/users/profile");
	return data.favorites || [];
};
