import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'

dotenv.config()

const url = process.env.DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN

async function main() {
  const client = createClient({ url, authToken })
  
  console.log('Verificando colunas da tabela Tenant...')
  
  try {
    const res = await client.execute("PRAGMA table_info(Tenant)")
    console.table(res.rows.map(r => ({ name: r.name, type: r.type })))
  } catch (e: any) {
    console.error('❌ Erro ao listar colunas:', e.message)
  }

  process.exit(0)
}

main()
