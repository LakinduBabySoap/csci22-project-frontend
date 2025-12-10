import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from '@/components/theme-provider'

export const Route = createRootRoute({
   component: RootComponent,
})

function RootComponent() {
   return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
         <div className="app min-h-screen bg-background text-foreground">
            <nav>{/* Navigation */}</nav>
            <Outlet />
         </div>
         <TanStackRouterDevtools />
      </ThemeProvider>
   )
}
