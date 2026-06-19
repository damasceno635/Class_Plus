-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "vencimento" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "alunoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
