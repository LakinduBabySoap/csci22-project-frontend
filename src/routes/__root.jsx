import { createRootRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

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
	return (
		<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
			<div className="flex h-screen flex-col">
				<header className="grid grid-cols-[auto_1fr_auto] items-center border-b bg-background px-4 py-3">
					{/* Logo */}
					<div className="items-center">
						<span className="text-xl font-bold">Good Website</span>
					</div>
					{/* Nav bar */}
					<div className="flex items-center justify-center gap-6">
						<nav className="flex items-center gap-8">
							<Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground hover:underline">
								Home
							</Link>
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
							<div className="flex items-center justify-center gap-6">
								<ModeToggle />
							</div>
						</nav>
					</div>
					{/* Profile icon */}
					<div className="flex items-center justify-end">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
							U
						</div>
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
