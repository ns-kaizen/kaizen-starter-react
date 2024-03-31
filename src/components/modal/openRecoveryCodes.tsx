import { openModal } from '@/components/Modal'
import { Button } from '@/components/ui/button'
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

type OpenRecoveryCodesProps = {
	recoveryCodes: string[]
}

export const openRecoveryCodes = (props: OpenRecoveryCodesProps) => {
	return openModal({
		render: (close) => <RecoveryCodes {...props} close={close} />,
	})
}

const RecoveryCodes = ({
	recoveryCodes,
	close,
}: OpenRecoveryCodesProps & { close: () => void }) => {
	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Two Factor Enabled</DialogTitle>
				<DialogDescription>
					These are your recovery codes. Keep them safe.
				</DialogDescription>
				<DialogClose />
			</DialogHeader>
			<div className="flex flex-col gap-6">
				{recoveryCodes.map((code) => (
					<div key={code} className="rounded-md bg-blue-50 p-4">
						{code}
					</div>
				))}
			</div>
			<DialogFooter className="flex justify-end">
				<Button onClick={close}>Ok</Button>
			</DialogFooter>
		</DialogContent>
	)
}
