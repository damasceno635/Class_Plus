-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "vaga" TEXT NOT NULL,
    "contrato" TEXT NOT NULL,
    "periodoContrato" TEXT NOT NULL,
    "dataFimContrato" TEXT,
    "cpf" TEXT NOT NULL,
    "ra" TEXT NOT NULL,
    "nascimento" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "celular" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "bloco" TEXT,
    "quadra" TEXT,
    "numero" TEXT NOT NULL,
    "salario" TEXT NOT NULL,
    "pagamento" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "documentos" TEXT[],
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formacoes_funcionarios" (
    "id" TEXT NOT NULL,
    "instituicao" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "periodoInicio" TEXT NOT NULL,
    "periodoFinal" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,

    CONSTRAINT "formacoes_funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiencias_funcionarios" (
    "id" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "periodoInicio" TEXT NOT NULL,
    "periodoFinal" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,

    CONSTRAINT "experiencias_funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turmas" (
    "id" TEXT NOT NULL,
    "ano" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,

    CONSTRAINT "turmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alocacoes_disciplinas" (
    "id" TEXT NOT NULL,
    "disciplina" TEXT NOT NULL,
    "cargaHoraria" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,

    CONSTRAINT "alocacoes_disciplinas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_userId_key" ON "funcionarios"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_ra_key" ON "funcionarios"("ra");

-- CreateIndex
CREATE UNIQUE INDEX "turmas_ano_serie_periodo_key" ON "turmas"("ano", "serie", "periodo");

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formacoes_funcionarios" ADD CONSTRAINT "formacoes_funcionarios_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiencias_funcionarios" ADD CONSTRAINT "experiencias_funcionarios_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacoes_disciplinas" ADD CONSTRAINT "alocacoes_disciplinas_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacoes_disciplinas" ADD CONSTRAINT "alocacoes_disciplinas_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
