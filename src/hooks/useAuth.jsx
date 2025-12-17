import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [role, setRole] = useState(localStorage.getItem("role"));
	const [username, setUsername] = useState(localStorage.getItem("username"));

	const isAuthenticated = !!token;

	const login = (newToken, newRole, newUsername) => {
		localStorage.setItem("token", newToken);
		localStorage.setItem("role", newRole);
		localStorage.setItem("username", newUsername);

		setToken(newToken);
		setRole(newRole);
		setUsername(newUsername);
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		localStorage.removeItem("username");

		setToken(null);
		setRole(null);
		setUsername(null);
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, token, role, username, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	return context;
};
