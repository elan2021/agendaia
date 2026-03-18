import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

const url = process.env.DATABASE_URL?.replace('libsql://', 'https://')
const token = process.env.TURSO_AUTH_TOKEN
const connectionUrl = url?.includes('?') ? `${url}&authToken=${token}` : `${url}?authToken=${token}`

export default defineConfig({
  datasource: {
    url: connectionUrl
  }
})
