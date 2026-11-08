-- CreateEnum
CREATE TYPE "obrigdireito_enum" AS ENUM ('O', 'D');

-- CreateTable
CREATE TABLE "fornecedores" (
    "seqpessoa" INTEGER NOT NULL,
    "nomerazao" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("seqpessoa")
);

-- CreateTable
CREATE TABLE "especies" (
    "codespecie" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "obrigdireito" "obrigdireito_enum" NOT NULL,

    CONSTRAINT "especies_pkey" PRIMARY KEY ("codespecie")
);

-- CreateTable
CREATE TABLE "titulos" (
    "seqtitulo" INTEGER NOT NULL,
    "dtaemissao" DATE NOT NULL,
    "dtavencimento" DATE NOT NULL,
    "vlrnominal" DECIMAL(10,2) NOT NULL,
    "vlrpago" DECIMAL(10,2) NOT NULL,
    "seqpessoa" INTEGER NOT NULL,
    "codespecie" TEXT NOT NULL,

    CONSTRAINT "titulos_pkey" PRIMARY KEY ("seqtitulo")
);

-- CreateIndex
CREATE INDEX "titulos_seqpessoa_idx" ON "titulos"("seqpessoa");

-- CreateIndex
CREATE INDEX "titulos_codespecie_idx" ON "titulos"("codespecie");

-- AddForeignKey
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_seqpessoa_fkey" FOREIGN KEY ("seqpessoa") REFERENCES "fornecedores"("seqpessoa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "titulos" ADD CONSTRAINT "titulos_codespecie_fkey" FOREIGN KEY ("codespecie") REFERENCES "especies"("codespecie") ON DELETE RESTRICT ON UPDATE CASCADE;
