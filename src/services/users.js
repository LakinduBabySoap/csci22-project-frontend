import axios from "axios";

const instance = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_API_URL,
	headers: {
		Authorization: `Bearer ${localStorage.getItem("token")}`,
	},
});

export const getAllUsers = async () => {
	const { data } = await instance.get("/users");
	return data;
};

export const createUser = async (userData) => {
	const { data } = await instance.post("/users", userData);
	return data;
};

export const updateUser = async (userId, userData) => {
	const { data } = await instance.put(`/users/${userId}`, userData);
	return data;
};

export const deleteUser = async (userId) => {
	await instance.delete(`/users/${userId}`);
	return true;
};
