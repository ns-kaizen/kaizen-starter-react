import { DarkModeToggle } from '@/components/DarkModeToggle'
import { toast } from 'sonner'
import { auth, useAuthStore } from '@/lib/auth'
import { TwoFactorButton } from '@/components/TwoFactorButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Home = () => {
	const { profile } = useAuthStore()

	const logout = async () => {
		if (await auth.logout()) {
			toast.success('Logged out')
		}
	}

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center bg-muted">
			<div className="absolute right-0 top-0 pr-3 pt-3">
				<DarkModeToggle />
			</div>

			<Card className="w-full max-w-sm divide-y">
				<CardHeader>
					<CardTitle>Welcome</CardTitle>
					<CardDescription>You are logged in.</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col divide-y p-0">
					<div className="px-6 py-2.5 text-sm">{profile?.email}</div>
					<div className="px-2">
						<TwoFactorButton variant="link">
							{profile?.twoFactorEnabled ? 'Disable' : 'Set up'} two factor
						</TwoFactorButton>
					</div>

					<div className="px-2">
						<Button onClick={logout} variant="link">
							Logout
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
