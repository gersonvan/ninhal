-- CreateTable
CREATE TABLE "Ninhada" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "codNinhada" TEXT NOT NULL,
    "anilhaMachoId" TEXT NOT NULL,
    "anilhaFemeaId" TEXT NOT NULL,
    "dataPostura" DATE NOT NULL,
    "ovosPrevistos" INTEGER,
    "ovosBotados" INTEGER,
    "ovosFerteis" INTEGER,
    "filhotesNascidos" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ninhada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ninhada_tenantId_codNinhada_key" ON "Ninhada"("tenantId", "codNinhada");

-- AddForeignKey
ALTER TABLE "Ninhada" ADD CONSTRAINT "Ninhada_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ninhada" ADD CONSTRAINT "Ninhada_anilhaMachoId_fkey" FOREIGN KEY ("anilhaMachoId") REFERENCES "Ave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ninhada" ADD CONSTRAINT "Ninhada_anilhaFemeaId_fkey" FOREIGN KEY ("anilhaFemeaId") REFERENCES "Ave"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
