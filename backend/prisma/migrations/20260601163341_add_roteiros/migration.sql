-- CreateTable
CREATE TABLE "roteiros" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "disciplina" TEXT NOT NULL,
    "turma" TEXT NOT NULL,
    "dataAplicacao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "metodologia" TEXT NOT NULL,
    "feedbackCoordenador" TEXT,
    "userId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roteiros_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "roteiros" ADD CONSTRAINT "roteiros_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
