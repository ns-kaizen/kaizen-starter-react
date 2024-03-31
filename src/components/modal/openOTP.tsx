import { openModal } from '@/components/Modal'
import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { useState } from 'react'

type OpenOTPProps = {
	onComplete: (otp: string) => Promise<boolean>
}

export const openOTP = (props: OpenOTPProps) => {
	return openModal({
		render: (close) => <OpenOPT {...props} close={close} />,
	})
}

const OpenOPT = ({ onComplete, close }: OpenOTPProps & { close: () => void }) => {
	const [otp, setOtp] = useState<string | undefined>(undefined)

	const handleComplete = async (value: string) => {
		const completed = await onComplete(value)
		if (completed) {
			close()
		} else {
			setOtp('')
		}
	}

	return (
		<DialogContent className="max-w-xl">
			<DialogHeader>
				<DialogTitle>Two Factor Authentication</DialogTitle>
				<DialogDescription>Enter the 6 digit code from your authenticator app</DialogDescription>
				<DialogClose />
			</DialogHeader>
			<div className="flex">
				<InputOTP
					maxLength={6}
					value={otp}
					onChange={setOtp}
					onComplete={handleComplete}
					className="flex-1"
					render={({ slots }) => (
						<>
							<InputOTPGroup className="flex-1">
								{slots.slice(0, 3).map((slot, index) => (
									<InputOTPSlot key={index} {...slot} className="h-20 flex-1 rounded-md text-2xl" />
								))}{' '}
							</InputOTPGroup>

							<InputOTPSeparator />

							<InputOTPGroup className="flex-1">
								{slots.slice(3).map((slot, index) => (
									<InputOTPSlot key={index} {...slot} className="h-20 flex-1 rounded-md text-2xl" />
								))}
							</InputOTPGroup>
						</>
					)}
				/>
			</div>
		</DialogContent>
	)
}
