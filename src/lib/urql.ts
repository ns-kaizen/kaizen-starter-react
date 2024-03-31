import { Client, fetchExchange } from 'urql'
import { cacheExchange } from 'urql'

export const client = new Client({
	url: `${import.meta.env.VITE_API_URL}/graphql`,
	exchanges: [cacheExchange, fetchExchange],
	fetchOptions: () => ({ credentials: 'include' }),
	suspense: true,

	// append operation name to the query string for easier debugging
	fetch: (url, fetchOptions) => {
		const body = JSON.parse(fetchOptions?.body?.toString() || '{}')
		return fetch(`${url}?${body.operationName}`, fetchOptions)
	},
})
