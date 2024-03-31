import { Button, ButtonProps } from '@/components/ui/button'
import { toast } from 'sonner'
import { openSetupTwoFactor } from '@/components/modal/openSetupTwoFactor'
import { auth, useAuthStore } from '@/lib/auth'

export const TwoFactorButton = (props: Omit<ButtonProps, 'onClick'>) => {
	const { profile } = useAuthStore()

	const setup2fa = async () => {
		const uri = await auth.setupTwoFactor()
		if (uri) openSetupTwoFactor({ uri })
	}

	const disable2fa = async () => {
		const disabled = await auth.disableTwoFactor()
		if (disabled) toast.success('2FA disabled')
	}

	return <Button onClick={profile?.twoFactorEnabled ? disable2fa : setup2fa} {...props} />
}
