import { createRootRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { Menu, Moon, Sun } from "lucide-react"; 
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LanguageProvider, useLanguage } from "@/hooks/LanguageContext"; 

export const Route = createRootRoute({
	component: RootComponent,
	beforeLoad: ({ context, location }) => {
		const publicPaths = new Set(["/login", "/login/", "/signup", "/signup/"]);
		if (!context.auth?.isAuthenticated && !publicPaths.has(location.pathname)) {
			throw redirect({ to: "/login/" });
		}
	},
});

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <button 
      onClick={toggleLanguage}
      className="px-3 py-1 text-xs font-semibold border rounded hover:bg-muted"
    >
      {language === "en" ? "中文" : "English"}
    </button>
  );
}

function LocalizedModeToggle() {
  const { setTheme } = useTheme();
  const { language } = useLanguage();

  const t = (en, zh) => (language === "en" ? en : zh);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background px-0 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {t("Light", "亮色")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {t("Dark", "暗色")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {t("System", "系統")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RootComponent() {
  // Wrap content inside LanguageProvider
  return (
    <LanguageProvider> 
       <InnerRoot />
    </LanguageProvider>
  );
}

function InnerRoot() {
	const { t, language } = useLanguage();
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
							{t('nav.title')}
						</Link>
					</div>

					{/* Desktop Nav bar - Hidden on Mobile */}
					<div className="flex items-center justify-center">
					<div className="hidden md:flex items-center justify-center gap-6">
						{isAdmin && (
							<nav className="flex items-center gap-8">
								<Link
									to="/events/"
									className="text-sm font-medium text-foreground/80 hover:text-foreground hover:underline"
								>
									{t('nav.events')}
								</Link>
								<Link
									to="/users/"
									className="text-sm font-medium text-foreground/80 hover:text-foreground hover:underline"
								>
									{t('nav.users')}
								</Link>
							</nav>
						)}
					</div>
					<div className="md:hidden">
							{isAdmin && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
											{language === 'en' ? 'Management' : '管理'}
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="center">
										<DropdownMenuItem asChild>
											<Link to="/events/" className="w-full cursor-pointer">{t('nav.events')}</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link to="/users/" className="w-full cursor-pointer">{t('nav.users')}</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</div>

					{/* Controls - Right Column */}
					<div className="flex items-center justify-end gap-2">
						<div className="flex items-center justify-center gap-2">
							<LanguageToggle />
							<LocalizedModeToggle />
						</div>
						
						{isAuthenticated && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="cursor-pointer ml-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">
											{avatarChar}
										</div>
									</button>
								</DropdownMenuTrigger>

								<DropdownMenuContent align="end">
									<DropdownMenuLabel>{username}</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={() => navigate({ to: "/profile/" })}>{t("nav.favorites")}</DropdownMenuItem>
									<DropdownMenuItem variant="destructive" onSelect={handleLogout}>
										{t("nav.logout")}
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
