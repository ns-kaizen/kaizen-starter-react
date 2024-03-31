import { KaizenAuth } from '@/lib/KaizenAuth'
import { z } from 'zod'

export const auth = new KaizenAuth({
	baseUrl: import.meta.env.VITE_API_URL,
	credentialsShape: z.object({
		email: z.string(),
		password: z.string(),
	}),
	profileShape: z.object({
		id: z.string(),
		email: z.string(),
		twoFactorEnabled: z.boolean(),
	}),
})

export const useAuthStore = auth.createStore()
