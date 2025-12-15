import axios from "axios";

const instance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_API_URL,
});

export const getVenues = async () => {
	const { data } = await instance.get("/venues");
	return data;
};