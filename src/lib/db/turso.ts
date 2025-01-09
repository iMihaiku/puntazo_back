import { type Config, createClient } from '@libsql/client'

const config: Config = {
  url: process.env.TURSO_URL ? process.env.TURSO_URL : 'URL No Establecida',
  authToken: process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN : ''
}
export const tursoClient = createClient(config)
