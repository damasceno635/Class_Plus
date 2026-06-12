-- CreateTable
CREATE TABLE "requisicoes" (
    "id" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "respostaSecretaria" TEXT,
    "arquivoAnexo" TEXT,
    "alunoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisicoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requisicoes_protocolo_key" ON "requisicoes"("protocolo");

-- AddForeignKey
ALTER TABLE "requisicoes" ADD CONSTRAINT "requisicoes_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
