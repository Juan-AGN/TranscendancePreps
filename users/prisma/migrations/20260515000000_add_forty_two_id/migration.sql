ALTER TABLE "Usuario" ADD COLUMN "fortyTwoId" INTEGER;
CREATE UNIQUE INDEX "Usuario_fortyTwoId_key" ON "Usuario"("fortyTwoId");
