import { prisma } from './src/lib/prisma'

async function main() {
  console.log('🏁 Iniciando migração manual de colunas...')
  
  const columns = [
    'endereco TEXT',
    'logo_url TEXT',
    'instagram_url TEXT',
    'facebook_url TEXT',
    'horario_funcionamento TEXT'
  ]

  for (const col of columns) {
    const colName = col.split(' ')[0]
    try {
      // Usando executeRawUnsafe pois ALTER TABLE não aceita parâmetros com $1
      await prisma.$executeRawUnsafe(`ALTER TABLE Tenant ADD COLUMN ${col}`)
      console.log(`✅ Coluna ${colName} adicionada.`)
    } catch (e: any) {
      if (e.message.includes('duplicate column name') || e.message.includes('already exists')) {
        console.log(`ℹ️ Coluna ${colName} já existe no banco.`)
      } else {
        console.error(`❌ Erro na coluna ${colName}:`, e.message)
      }
    }
  }

  console.log('✨ Migração concluída.')
  process.exit(0)
}

main().catch(err => {
  console.error('💥 Erro fatal na migração:', err)
  process.exit(1)
})
