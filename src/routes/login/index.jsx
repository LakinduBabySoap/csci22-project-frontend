import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loginUser } from "@/services/authenication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Alert, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/login/")({
	component: LoginPage,
});

function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { login, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const router = useRouter();

	// Redirect to home if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			// Invalidate router to ensure all loaders re-run with new auth state
			router.invalidate().then(() => {
				navigate({ to: "/" });
			});
		}
	}, [isAuthenticated]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const data = await loginUser({ username, password });
			login(data.token, data.role);
		} catch (err) {
			setError(err.response?.data?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex h-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Login</CardTitle>
							<CardDescription>
								{error && (
									<Alert variant="destructive">
										<AlertTitle>{error}</AlertTitle>
									</Alert>
								)}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit}>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="username">Username</FieldLabel>
										<Input
											id="username"
											type="text"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											required
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor="password">Password</FieldLabel>
										<Input
											id="password"
											type="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
										/>
									</Field>
									<Field>
										<Button type="submit" disabled={loading}>
											{loading ? "Logging in..." : "Login"}
										</Button>
										<FieldDescription className="text-center">
											Don&apos;t have an account? <a href="/signup">Sign up</a>
										</FieldDescription>
									</Field>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
