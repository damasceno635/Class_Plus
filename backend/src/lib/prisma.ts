// backend/src/lib/prisma.ts (ou backend/prisma/client.ts)
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// O adapter usa uma pool de conexões do 'pg'
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Passa o adapter para o construtor do PrismaClient
const prisma = new PrismaClient({ adapter });

export default prisma;