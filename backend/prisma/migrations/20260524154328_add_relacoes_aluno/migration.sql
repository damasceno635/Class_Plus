-- CreateTable
CREATE TABLE "responsaveis" (
    "id" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "responsaveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deficiencias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "apoio" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "deficiencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alergias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "alergias_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "responsaveis" ADD CONSTRAINT "responsaveis_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deficiencias" ADD CONSTRAINT "deficiencias_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alergias" ADD CONSTRAINT "alergias_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
