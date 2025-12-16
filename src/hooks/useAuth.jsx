import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
	const [role, setRole] = useState(localStorage.getItem("role"));

	const login = (token, role) => {
		localStorage.setItem("token", token);
		localStorage.setItem("role", role);
		setIsAuthenticated(true);
		setRole(role);
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		setIsAuthenticated(false);
		setRole(null);
	};

	return <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
