import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// Import the generated route tree
import { routeTree } from "@/routeTree.gen";
import { ThemeProvider } from "@/components/theme-provider";

// Create a new router instance
const router = createRouter({ routeTree });

function App() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ auth }} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<ThemeProvider>
			<AuthProvider>
				<App />
			</AuthProvider>
		</ThemeProvider>
	</React.StrictMode>
);
