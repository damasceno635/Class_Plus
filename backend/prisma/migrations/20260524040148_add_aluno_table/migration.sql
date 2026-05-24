-- CreateTable
CREATE TABLE "alunos" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nascimento" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "nivelEnsino" TEXT NOT NULL,
    "anoTurma" TEXT NOT NULL,
    "serieTurma" TEXT NOT NULL,
    "anoLetivo" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "documentos" TEXT[],
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alunos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alunos_matricula_key" ON "alunos"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_userId_key" ON "alunos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "alunos_cpf_key" ON "alunos"("cpf");

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
