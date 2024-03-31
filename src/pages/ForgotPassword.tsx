import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/auth'
import { ChevronLeft, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export const ForgotPassword = () => {
	const [email, setEmail] = useState('')

	const [loading, setLoading] = useState(false)

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault()

		if (!email || loading) return

		setLoading(true)

		const { error } = await auth.forgotPassword(email)

		if (error) {
			toast.error(error)
			setLoading(false)
			return
		}

		toast.success('Check your email for a reset link')

		setLoading(false)
	}

	return (
		<div className="relative flex h-screen w-full flex-col items-center justify-center bg-muted p-4">
			<div className="absolute right-0 top-0 pr-3 pt-3">
				<DarkModeToggle />
			</div>

			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Forgot Password?</CardTitle>
					<CardDescription>Enter your email and we'll send you a reset link.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit} className="contents">
					<CardContent>
						<div className="flex flex-col gap-2">
							<Label>Email</Label>
							<Input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="me@example.com"
								required
							/>
						</div>
					</CardContent>
					<CardFooter>
						<Button type="submit" className="w-full">
							{loading && <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />}
							Request password reset
						</Button>
					</CardFooter>
				</form>
			</Card>

			<div className="mt-4 w-full max-w-sm">
				<Link to="/" className={buttonVariants({ variant: 'link' })}>
					<ChevronLeft className="mr-2 w-4" />
					Back to Login
				</Link>
			</div>
		</div>
	)
}
