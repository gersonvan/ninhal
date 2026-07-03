-- CreateEnum
CREATE TYPE "SexoAve" AS ENUM ('MACHO', 'FEMEA', 'NAO_SEXADO');

-- CreateEnum
CREATE TYPE "OrigemAve" AS ENUM ('NASCIDA_NO_CRIATORIO', 'ADQUIRIDA');

-- CreateEnum
CREATE TYPE "StatusAve" AS ENUM ('ATIVO', 'RESERVADO', 'VENDIDO', 'OBITO', 'FUGIU');

-- CreateTable
CREATE TABLE "Especie" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Especie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ave" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "anilha" TEXT NOT NULL,
    "nomeApelido" TEXT,
    "especieId" TEXT NOT NULL,
    "mutacaoCor" TEXT,
    "sexo" "SexoAve" NOT NULL,
    "dataNascimento" DATE,
    "origem" "OrigemAve" NOT NULL,
    "anilhaPaiId" TEXT,
    "anilhaMaeId" TEXT,
    "status" "StatusAve" NOT NULL DEFAULT 'ATIVO',
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Especie_nome_key" ON "Especie"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Ave_tenantId_anilha_key" ON "Ave"("tenantId", "anilha");

-- AddForeignKey
ALTER TABLE "Ave" ADD CONSTRAINT "Ave_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ave" ADD CONSTRAINT "Ave_especieId_fkey" FOREIGN KEY ("especieId") REFERENCES "Especie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ave" ADD CONSTRAINT "Ave_anilhaPaiId_fkey" FOREIGN KEY ("anilhaPaiId") REFERENCES "Ave"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ave" ADD CONSTRAINT "Ave_anilhaMaeId_fkey" FOREIGN KEY ("anilhaMaeId") REFERENCES "Ave"("id") ON DELETE SET NULL ON UPDATE CASCADE;
