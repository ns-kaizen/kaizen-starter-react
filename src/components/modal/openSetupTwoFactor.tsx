import { openModal } from '@/components/Modal'
import { openRecoveryCodes } from '@/components/modal/openRecoveryCodes'
import { Button } from '@/components/ui/button'
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from '@/components/ui/input-otp'
import { auth } from '@/lib/auth'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'

type OpenSetupTwoFactorProps = {
	uri: string
}

export const openSetupTwoFactor = (props: OpenSetupTwoFactorProps) => {
	return openModal({
		render: (close) => <SetupTwoFactor {...props} close={close} />,
	})
}

const SetupTwoFactor = ({
	uri,
	close,
}: OpenSetupTwoFactorProps & { close: () => void }) => {
	const code = uri.match(/secret=([A-Z0-9]*)/)?.[1]

	const confirm2fa = async (otp: string) => {
		const { error, recoveryCodes } = await auth.confirmTwoFactor(otp)

		if (error) {
			toast.error('Invalid code')
			return
		}

		openRecoveryCodes({ recoveryCodes })
		toast.success('2FA enabled')
		close()
	}

	return (
		<DialogContent className="p-0 overflow-hidden">
			<DialogHeader className="p-6 pb-0">
				<DialogTitle>Two Factor Authentication</DialogTitle>
				<DialogDescription>
					Add an extra level of security to your account
				</DialogDescription>
				<DialogClose />
			</DialogHeader>
			<div className="flex flex-col gap-8 p-4">
				<div className="flex justify-center">
					<QRCodeSVG value={uri} className="w-[128px] h-[128px]" />
				</div>

				<div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-8">
					<div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-600/20">
						1
					</div>

					<div className="flex flex-col items-start gap-3">
						<div className="mt-1">
							Scan the QR Code using any authentication app on
							your phone or enter the following code:
						</div>

						<div className="font-medium text-sm p-2 bg-blue-50 dark:bg-blue-600/20 rounded-md">
							{code}
						</div>
					</div>

					<div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-600/20">
						2
					</div>

					<div className="flex flex-col gap-3 pr-12">
						<div className="mt-1">
							Enter the 6 digit code from the authenticator app
						</div>
						<InputOTP
							maxLength={6}
							onComplete={(value) => confirm2fa(value)}
							className="w-full flex justify-between"
							render={({ slots }) => (
								<>
									<InputOTPGroup className="justify-between flex-1">
										{slots
											.slice(0, 3)
											.map((slot, index) => (
												<InputOTPSlot
													key={index}
													{...slot}
													className="w-10 h-12 text-lg rounded-md"
												/>
											))}{' '}
									</InputOTPGroup>
									<InputOTPSeparator />
									<InputOTPGroup className="justify-between flex-1">
										{slots.slice(3).map((slot, index) => (
											<InputOTPSlot
												key={index}
												{...slot}
												className="w-10 h-12 text-lg rounded-md"
											/>
										))}
									</InputOTPGroup>
								</>
							)}
						/>
					</div>
				</div>
			</div>
			<DialogFooter className="flex justify-end border-t gap-4 bg-muted/50 p-4">
				<Button onClick={() => close()} variant="cancel">
					Cancel
				</Button>
				<Button
					onClick={() => {
						// confirm2fa()
					}}
					variant="default"
					className="rounded-full px-8"
				>
					Activate
				</Button>
			</DialogFooter>
		</DialogContent>
	)
}
