import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/auth'
import { ChevronLeft, Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export const ResetPassword = () => {
	const navigate = useNavigate()

	const [query] = useSearchParams()

	const [password, setPassword] = useState('')
	const [password2, setPassword2] = useState('')

	const passwordsDontMatch = password.length > 0 && password2.length > 0 && password !== password2

	const [loading, setLoading] = useState(false)

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault()

		if (!password || password !== password2 || loading) return

		setLoading(true)

		const { error } = await auth.resetPassword({
			code: query.get('code'),
			password,
		})

		if (error) {
			toast.error(error)
			setLoading(false)
			return
		}
		setLoading(false)

		toast.success('Password Reset')
		navigate('/')
	}

	return (
		<div className="relative flex h-screen w-full flex-col items-center justify-center bg-muted p-4">
			<div className="absolute right-0 top-0 pr-3 pt-3">
				<DarkModeToggle />
			</div>

			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Reset Password</CardTitle>
					<CardDescription>Your new password must be at least 8 characters.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit} className="contents">
					<CardContent className="grid gap-4">
						<div className="flex flex-col gap-2">
							<Label>New Password</Label>
							<Input value={password} type="password" onChange={(e) => setPassword(e.target.value)} />
						</div>

						<div className="flex flex-col gap-2">
							<Label>Confirm Password</Label>
							<Input value={password2} type="password" onChange={(e) => setPassword2(e.target.value)} />
							{passwordsDontMatch && (
								<div className="flex justify-start">
									<div className="text-sm text-destructive">Passwords do not match</div>
								</div>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button
							type="submit"
							className="w-full"
							disabled={passwordsDontMatch || password.length < 8 || password.length < 8}
						>
							{loading && <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />}
							Reset
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
