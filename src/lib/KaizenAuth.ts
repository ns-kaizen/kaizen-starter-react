import { toast } from 'sonner'
import { z } from 'zod'
import { create } from 'zustand'

// https://www.youtube.com/watch?v=2lCCKiWGlC0
type Prettify<T> = {
	[K in keyof T]: T[K]
} & {} // eslint-disable-line @typescript-eslint/ban-types

type KaizenAuthOptions<Credentials, Profile> = {
	baseUrl: string
	credentialsShape: Credentials
	profileShape: Profile
}

type LoginTwoFactorFn = (otp: string) => Promise<Prettify<LoginErrorResponse> | Prettify<LoginTokenResponse>>

type LoginErrorResponse = {
	token: null
	twoFactor: null
	error: string
}

type LoginTokenResponse = {
	token: string
	twoFactor: null
	error: null
}

type LoginTwoFactorResponse = {
	token: null
	twoFactor: LoginTwoFactorFn
	error: null
}

type ConfirmTwoFactorResponse = {
	error: null
	recoveryCodes: string[]
}

type ConfirmTwoFactorErrorResponse = {
	error: string
	recoveryCodes: []
}

type ResendConfirmationResponse = {
	error: null
	message: string
}

type ResendConfirmationErrorResponse = {
	error: string
	message: null
}

export class KaizenAuth<Credentials extends z.ZodTypeAny, Profile extends z.ZodTypeAny> {
	/**
	 * The base url of the server. Do not include a slash at the end
	 */
	private baseUrl: string

	/**
	 * The shape of the user's profile, defined by a zod schema
	 */
	private profileShape: z.ZodTypeAny

	/**
	 * Basic subscription listeners for the user's authentication state
	 */
	private listeners: Array<(state: { isLoggedIn: boolean }) => void> = []

	/**
	 * Create an instance of KaizenAuth
	 */
	constructor(options: KaizenAuthOptions<Credentials, Profile>) {
		this.baseUrl = options.baseUrl || ''
		this.profileShape = options.profileShape
	}

	/**
	 * Whether the user is logged in
	 */
	isLoggedIn = (): boolean => document.cookie.includes('auth_exists=true')

	/**
	 * Attempt to login with an email and password.
	 * If two factor is enabled, then a function is returned to re-attempt the login with the one-time password, and remembers the previously attempted email and password.
	 */
	async login(
		credentials: z.infer<Credentials>
	): Promise<LoginErrorResponse | LoginTokenResponse | LoginTwoFactorResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/api/auth/login`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials),
			})

			// if the response is not ok, return an error
			if (!response.ok) {
				return {
					token: null,
					twoFactor: null,
					error: response.status === 404 ? 'Not found' : await response.text(),
				}
			}

			const json = await response.json()

			// if the server requires two factor, return a function to handle it
			if (json.twoFactor) {
				return {
					token: null,
					error: null,
					twoFactor: (otp: string) => {
						return this.loginTwoFactor({ ...credentials, otp })
					},
				}
			}

			this.listeners.forEach((listener) => listener({ isLoggedIn: true }))

			// if the server returns a token, return it
			return {
				error: null,
				token: json.token,
				twoFactor: null,
			}
		} catch (error) {
			if (error instanceof Error) {
				return {
					token: null,
					twoFactor: null,
					error: error.message,
				}
			}
			console.log(error)
			return {
				token: null,
				twoFactor: null,
				error: 'Unknown error',
			}
		}
	}

	/**
	 * Attempt to login with an email, password, and one-time password.
	 */
	async loginTwoFactor(credentials: Prettify<z.infer<Credentials> & { otp: string }>): ReturnType<LoginTwoFactorFn> {
		try {
			const response = await fetch(`${this.baseUrl}/api/auth/login`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials),
			})

			if (!response.ok) {
				return {
					token: null,
					twoFactor: null,
					error: response.status === 404 ? 'Not found' : await response.text(),
				}
			}

			this.listeners.forEach((listener) => listener({ isLoggedIn: true }))

			return {
				error: null,
				token: (await response.json()).token,
				twoFactor: null,
			}
		} catch (error) {
			if (error instanceof Error) {
				return {
					token: null,
					twoFactor: null,
					error: error.message,
				}
			}
			console.log(error)
			return {
				token: null,
				twoFactor: null,
				error: 'Unknown error',
			}
		}
	}

	/**
	 * Get the user's profile from the server, assuming you're logged in.
	 */
	async getProfile() {
		try {
			const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
				method: 'GET',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			})

			if (!response.ok) {
				if (response.status === 401) {
					this.kick()
				}
			}

			const profile = this.profileShape.parse(await response.json())

			return profile
		} catch (error) {
			console.log(error)
			return null
		}
	}

	private kick() {
		this.listeners.forEach((listener) => listener({ isLoggedIn: false }))
	}

	/**
	 * Log the user out
	 */
	async logout() {
		try {
			const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
			})

			if (response.ok) {
				this.kick()
				return true
			}

			return false
		} catch (error) {
			console.log(error)
			return false
		}
	}

	/**
	 * Confirm the user's account with a code sent to their email
	 */
	async confirmAccount({
		userId,
		code,
	}: {
		userId?: string | number | null
		code?: string | null
	}): Promise<{ error: string | null }> {
		if (!userId) return { error: 'No user id provided' }
		if (!code) return { error: 'No confirmation code provided' }

		try {
			const response = await fetch(`${this.baseUrl}/api/auth/confirm-account`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					userId,
					code,
				}),
			})

			return { error: !response.ok ? await response.text() : null }
		} catch (error) {
			console.log(error)
			return {
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Resend the confirmation email to the user
	 */
	async resendConfirmation(
		userId: string | number
	): Promise<ResendConfirmationResponse | ResendConfirmationErrorResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/api/auth/resend-account-confirmation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					userId,
				}),
			})

			if (!response.ok) {
				return {
					message: null,
					error: response.status === 404 ? 'Not found' : await response.text(),
				}
			}

			return { error: null, message: (await response.json()).message }
		} catch (error) {
			console.log(error)
			return {
				error: error instanceof Error ? error.message : 'Unknown error',
				message: null,
			}
		}
	}

	/**
	 * Send a password reset email to the user's email
	 */
	async forgotPassword(email: string): Promise<{ error: string | null }> {
		try {
			const response = await fetch(`${this.baseUrl}/api/auth/reset-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					email,
				}),
			})

			return { error: !response.ok ? await response.text() : null }
		} catch (error) {
			console.log(error)
			return {
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Reset the users password with the code sent to their email
	 */
	async resetPassword({
		password,
		code,
	}: {
		password: string
		code?: string | null
	}): Promise<{ error: string | null }> {
		if (!code) return { error: 'No reset code provided' }

		try {
			const response = await fetch(`${this.baseUrl}/api/auth/reset-password/${code}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					password,
				}),
			})

			return { error: !response.ok ? await response.text() : null }
		} catch (error) {
			console.log(error)
			return {
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	/**
	 * Ask the server for a uri to setup two factor authentication.
	 * @returns The uri to encode as a QR code
	 */
	async setupTwoFactor() {
		try {
			const response = await fetch(`${this.baseUrl}/api/auth/setup-twofactor`, {
				method: 'POST',
				credentials: 'include',
			})

			if (!response.ok) {
				if (response.status === 401) {
					this.kick()
				}
				return null
			}

			const data = z.object({ uri: z.string() }).parse(await response.json())
			return data.uri
		} catch (error) {
			console.log(error)
			return null
		}
	}

	/**
	 * Enable two factor authentication for the user by by submitting a valid one-time password from an authenticator app
	 */
	async confirmTwoFactor(otp: string): Promise<ConfirmTwoFactorErrorResponse | ConfirmTwoFactorResponse> {
		try {
			const response = await fetch(`${this.baseUrl}/api/auth/confirm-twofactor`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ otp }),
			})

			if (!response.ok) {
				if (response.status === 401) {
					this.kick()
				}
				return {
					error: response.status === 404 ? 'Not found' : await response.text(),
					recoveryCodes: [],
				}
			}

			const data = await response.json()

			return {
				error: null,
				recoveryCodes: data.recoveryCodes,
			}
		} catch (error) {
			console.log(error)
			return {
				error: error instanceof Error ? error.message : 'Unknown error',
				recoveryCodes: [],
			}
		}
	}

	/**
	 * Disable two factor authentication
	 */
	async disableTwoFactor() {
		try {
			const response = await fetch(`${this.baseUrl}/api/auth/disable-twofactor`, {
				method: 'POST',
				credentials: 'include',
			})

			if (!response.ok) {
				if (response.status === 401) {
					this.kick()
				}
				return false
			}

			return true
		} catch (error) {
			console.log(error)
			return false
		}
	}

	/**
	 * Create a zustand store for the user's authentication state
	 */
	createStore = () => {
		const store = create<{
			isLoggedIn: boolean
			profile: z.infer<Profile> | null
		}>(() => ({
			// this cookie is set by the server when the user logs in.
			// It's kept in sync even when the server refreshes the session.
			// if the real cookie expires, so does this one.
			isLoggedIn: this.isLoggedIn(),
			profile: null,
		}))

		if (this.isLoggedIn()) {
			this.getProfile().then((profile) => store.setState({ profile }))
		}

		let wasLoggedIn = this.isLoggedIn()
		setInterval(() => {
			if (wasLoggedIn && !this.isLoggedIn()) {
				wasLoggedIn = false

				store.setState({ isLoggedIn: false, profile: null })

				toast.info('Your session has expired. Please log in again.', {
					important: true,
				})
			}
		}, 1000)

		this.listeners.push((state) => {
			if (state.isLoggedIn) {
				// store.setState({ isLoggedIn: state.isLoggedIn })
				this.getProfile().then((profile) => store.setState({ profile }))
				wasLoggedIn = true
			} else {
				store.setState({ isLoggedIn: state.isLoggedIn, profile: null })
				wasLoggedIn = false
			}
		})

		return store
	}
}
