import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/')({
   component: UsersPage,
})

function UsersPage() {
   return <div>Users Page</div>
}
