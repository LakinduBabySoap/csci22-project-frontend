import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup/')({
   component: SignUpPage,
})

function SignUpPage() {
   return <div>Sign Up Page</div>
}
