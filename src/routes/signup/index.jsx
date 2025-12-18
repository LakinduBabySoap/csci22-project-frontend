import { createFileRoute, useNavigate, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signupUser } from "@/services/authenication";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/hooks/LanguageContext";

export const Route = createFileRoute("/signup/")({
	component: SignUpPage,
});

function SignUpPage() {
	const navigate = useNavigate();
	const router = useRouter();
	const { isAuthenticated } = useAuth();
	const { t } = useLanguage();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isAuthenticated) {
			router.invalidate().then(() => navigate({ to: "/" }));
		}
	}, [isAuthenticated]);

	const rules = useMemo(() => {
		return {
			minLen: password.length >= 8,
			lower: /[a-z]/.test(password),
			upper: /[A-Z]/.test(password),
			number: /\d/.test(password),
			symbol: /[^A-Za-z0-9]/.test(password),
		};
	}, [password]);

	const strongPassword = rules.minLen && rules.lower && rules.upper && rules.number && rules.symbol;

	const passwordsMatch = password === confirm;

	const canSubmit = username.trim().length > 0 && strongPassword && passwordsMatch && !loading;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		const cleanUsername = username.trim();

		if (!cleanUsername) {
			setError(t("signup.usernameRequired"));
			return;
		}

		if (!strongPassword) {
			setError(t("signup.weakPassword"));
			return;
		}

		if (!passwordsMatch) {
			setError(t("signup.passwordMismatch"));
			return;
		}

		setLoading(true);
		try {
			await signupUser({ username: cleanUsername, password });

			setSuccess(t("signup.success"));
			setPassword("");
			setConfirm("");

			setTimeout(() => {
				navigate({ to: "/login/" });
			}, 2000);
		} catch (err) {
			const code = err.response?.data?.code;
			if (code) setError(t(`errors.${code}`));
			else setError(err.response?.data?.message || t("signup.failed"));
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
							<CardTitle>{t("signup.title")}</CardTitle>
							<CardDescription className="space-y-2">
								{error && (
									<Alert variant="destructive">
										<AlertTitle>{error}</AlertTitle>
									</Alert>
								)}
								{success && (
									<Alert>
										<AlertTitle>{success}</AlertTitle>
									</Alert>
								)}
							</CardDescription>
						</CardHeader>

						<CardContent>
							<form onSubmit={handleSubmit}>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="username">{t("signup.username")}</FieldLabel>
										<Input
											id="username"
											type="text"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											required
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="password">{t("signup.password")}</FieldLabel>
										<Input
											id="password"
											type="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
										/>
										<FieldDescription className="space-y-1">
											<div className={rules.minLen ? "text-foreground" : "text-muted-foreground"}>
												• {t("signup.ruleMinLen")}
											</div>
											<div className={rules.lower ? "text-foreground" : "text-muted-foreground"}>
												• {t("signup.ruleLower")}
											</div>
											<div className={rules.upper ? "text-foreground" : "text-muted-foreground"}>
												• {t("signup.ruleUpper")}
											</div>
											<div className={rules.number ? "text-foreground" : "text-muted-foreground"}>
												• {t("signup.ruleNumber")}
											</div>
											<div className={rules.symbol ? "text-foreground" : "text-muted-foreground"}>
												• {t("signup.ruleSymbol")}
											</div>
										</FieldDescription>
									</Field>

									<Field>
										<FieldLabel htmlFor="confirmPassword">{t("signup.confirmPassword")}</FieldLabel>
										<Input
											id="confirm"
											type="password"
											value={confirm}
											onChange={(e) => setConfirm(e.target.value)}
											required
										/>
										{!passwordsMatch && confirm.length > 0 && (
											<FieldDescription className="text-destructive">{t("signup.passwordMismatch")}</FieldDescription>
										)}
									</Field>

									<Field>
										<Button type="submit" className="w-full" disabled={!canSubmit}>
											{loading ? t("signup.loading") : t("signup.btn")}
										</Button>

										<FieldDescription className="text-center">
											{t("signup.haveAccount")} <Link to="/login/">{t("signup.login")}</Link>
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
