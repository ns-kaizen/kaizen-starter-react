import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { auth } from '@/lib/auth'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export const ConfirmAccount = () => {
	const navigate = useNavigate()

	const [query] = useSearchParams()

	const [code, setCode] = useState('')

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault()

		const { error } = await auth.confirmAccount({
			userId: query.get('userId'),
			code,
		})

		if (error) {
			toast.error(error)
			return
		}

		toast.success('Account Confirmed')
		navigate('/')
	}

	return (
		<div className="relative flex h-screen w-full flex-col items-center justify-center bg-muted p-4">
			<div className="absolute right-0 top-0 pr-3 pt-3">
				<DarkModeToggle />
			</div>

			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Confirm Account</CardTitle>
					<CardDescription>Enter the code we sent to your email to confirm your account.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit} className="contents">
					<CardContent className="grid gap-4">
						<div className="flex flex-col gap-2">
							<Label>Confirmation Code</Label>
							<Input value={code} onChange={(e) => setCode(e.target.value)} />
						</div>
					</CardContent>
					<CardFooter>
						<Button type="submit" className="w-full">
							Confirm
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
