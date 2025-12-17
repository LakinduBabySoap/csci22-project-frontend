import { createRootRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Route = createRootRoute({
	component: RootComponent,
	beforeLoad: ({ context, location }) => {
		const publicPaths = new Set(["/login", "/login/", "/signup", "/signup/"]);
		if (!context.auth?.isAuthenticated && !publicPaths.has(location.pathname)) {
			throw redirect({ to: "/login/" });
		}
	},
});

function RootComponent() {
	const { isAuthenticated, role, username, logout } = useAuth();
	const navigate = useNavigate();
	const router = useRouter();

	const isAdmin = role === "admin";

	const avatarChar = (username?.[0] || "U").toUpperCase();

	const handleLogout = async () => {
		logout();
		await router.invalidate();
		navigate({ to: "/login/" });
	};

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
									to="/events/"
									className="text-sm font-medium text-foreground/80 hover:text-foreground hover:underline"
								>
									Event List
								</Link>
								<Link
									to="/users/"
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
						{isAuthenticated && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="cursor-pointer">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">
											{avatarChar}
										</div>
									</button>
								</DropdownMenuTrigger>

								<DropdownMenuContent align="end">
									<DropdownMenuLabel>{username}</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={() => navigate({ to: "/profile/" })}>Favourite</DropdownMenuItem>
									<DropdownMenuItem variant="destructive" onSelect={handleLogout}>
										Log Out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
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
