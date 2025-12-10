import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeProvider } from '@/components/theme-provider'

export const Route = createRootRoute({
   component: RootComponent,
})

function RootComponent() {
   return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
         <div className="min-h-screen flex flex-col">
            <nav>{/* Navigation */}</nav>
            <div className="flex-1">
               <Outlet />
            </div>
         </div>
         <TanStackRouterDevtools />
      </ThemeProvider>
   )
}
