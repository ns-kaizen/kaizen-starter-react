import { DarkModeToggle } from '@/components/DarkModeToggle'
import { openOTP } from '@/components/modal/openOTP'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/auth'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault()

		if (!email || !password) return

		const { error, twoFactor } = await auth.login({ email, password })

		if (error) {
			toast.error(error)
			return
		}

		if (twoFactor) {
			openOTP({
				onComplete: async (otp) => {
					const { error } = await twoFactor(otp)

					if (error) {
						toast.error(error)
						return false
					}

					toast.success('Logged in')
					return true
				},
			})
			return
		}

		toast.success('Logged in')
	}

	return (
		<div className="relative flex h-screen w-full flex-col items-center justify-center bg-muted p-4">
			<div className="absolute right-0 top-0 pr-3 pt-3">
				<DarkModeToggle />
			</div>

			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>Enter your email below to login to your account.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit} className="contents">
					<CardContent className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label>Email</Label>
							<Input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								type="email"
								placeholder="me@example.com"
								required
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label>Password</Label>
							<Input
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								type="password"
								required
							/>
						</div>

						<Link className="text-sm text-muted-foreground underline" to="/forgot-password">
							Forgot your password?
						</Link>
					</CardContent>
					<CardFooter>
						<Button type="submit" className="w-full">
							Sign in
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
