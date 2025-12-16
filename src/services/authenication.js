import axios from "axios";

const instance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_API_URL,
});

export const loginUser = async (credentials) => {
	const { data } = await instance.post("/auth/login", credentials);
	return data;
};
