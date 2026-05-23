// backend/prisma.config.ts
import { defineConfig, env } from 'prisma/config'
import 'dotenv/config' // Carrega as variáveis do .env

export default defineConfig({
  schema: 'prisma/schema.prisma', // Caminho para o seu schema
  datasource: {
    url: env('DATABASE_URL'), // A URL do banco é lida daqui pelo CLI
  },
})