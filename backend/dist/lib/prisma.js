"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/lib/prisma.ts (ou backend/prisma/client.ts)
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
// O adapter usa uma pool de conexões do 'pg'
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
// Passa o adapter para o construtor do PrismaClient
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
