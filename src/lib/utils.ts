import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { generateRandomString, alphabet } from 'oslo/crypto'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const generateId = (length = 15) => {
	return generateRandomString(length, alphabet('a-z', '0-9'))
}
