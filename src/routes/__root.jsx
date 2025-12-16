import { createRootRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/useAuth";

export const Route = createRootRoute({
	component: RootComponent,
	beforeLoad: ({ context, location }) => {
		if (!context.auth?.isAuthenticated && location.pathname !== "/login" && location.pathname !== "/signup") {
			throw redirect({
				to: "/login",
			});
		}
	},
});

function RootComponent() {
	const { isAuthenticated, role } = useAuth();
	const isAdmin = isAuthenticated && role === "admin";

	return (
		<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
			<div className="flex h-screen flex-col">
				<header className="grid grid-cols-[auto_1fr_auto] items-center border-b bg-background px-4 py-3">
					{/* Logo */}
					<div className="items-center">
						<Link to="/" className="text-xl font-bold text-foreground">
							Good Website
						</Link>
					</div>
					{/* Nav bar */}
					<div className="flex items-center justify-center gap-6">
						{isAdmin && (
							<nav className="flex items-center gap-8">
								<Link
									to="/events"
									className="text-sm font-medium text-foreground/80 hover:text-foreground hover:underline"
								>
									Event List
								</Link>
								<Link
									to="/users"
									className="text-sm font-medium text-foreground/80 hover:text-foreground hover:underline"
								>
									User List
								</Link>
							</nav>
						)}
               		</div>

					{/* Theme toggle & Profile icon */}
					<div className="flex items-center justify-end">
						<div className="flex items-center justify-center gap-6">
							<ModeToggle />
						</div>
						<Link to="/profile" className="cursor-pointer">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">
								U
							</div>
						</Link>
					</div>
					<TanStackRouterDevtools />
				</header>

				<div className="flex-1">
					<Outlet />
				</div>
			</div>
		</ThemeProvider>
	);
}
