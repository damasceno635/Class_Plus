-- CreateTable
CREATE TABLE "frequencias" (
    "id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "observacao" TEXT,
    "alunoId" TEXT NOT NULL,
    "alocacaoId" TEXT NOT NULL,

    CONSTRAINT "frequencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas" (
    "id" TEXT NOT NULL,
    "bimestre" TEXT NOT NULL,
    "n1" TEXT,
    "n2" TEXT,
    "n3" TEXT,
    "n4" TEXT,
    "alunoId" TEXT NOT NULL,
    "alocacaoId" TEXT NOT NULL,

    CONSTRAINT "notas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "frequencias_alunoId_alocacaoId_data_key" ON "frequencias"("alunoId", "alocacaoId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "notas_alunoId_alocacaoId_bimestre_key" ON "notas"("alunoId", "alocacaoId", "bimestre");

-- AddForeignKey
ALTER TABLE "frequencias" ADD CONSTRAINT "frequencias_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frequencias" ADD CONSTRAINT "frequencias_alocacaoId_fkey" FOREIGN KEY ("alocacaoId") REFERENCES "alocacoes_disciplinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas" ADD CONSTRAINT "notas_alocacaoId_fkey" FOREIGN KEY ("alocacaoId") REFERENCES "alocacoes_disciplinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
