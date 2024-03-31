import fetch from 'node-fetch'
import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql'
import { writeFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const getSchema = async () => {
	const baseUrl = process?.env.VITE_API_URL
	if (!baseUrl) return

	// get introspection json from gql api
	const introspectionRes = await fetch(`${baseUrl}/graphql`, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ query: getIntrospectionQuery() }),
	})
	const schema = await introspectionRes.json()

	return schema?.data
}

const main = async () => {
	const schema = await getSchema()
	if (schema) {
		const sdl = printSchema(buildClientSchema(schema))
		writeFileSync('./schema.graphql', sdl)
	}
}

main()
