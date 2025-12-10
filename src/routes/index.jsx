import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
   component: HomePage,
})

function HomePage() {
   return (
      <div className="p-4">
         <h1 className="text-3xl font-bold">Cultural Events</h1>
         <p className="mt-4 text-muted-foreground">
            Welcome to the Cultural Events application
         </p>
      </div>
   )
}

export default HomePage
