import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { routeTree } from "@/routeTree.gen";

const router = createRouter({ routeTree });

function App() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ auth }} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</React.StrictMode>
);
