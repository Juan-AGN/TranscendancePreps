/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "estadoOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ultimaConexion" TIMESTAMP(3);

-- DropTable
DROP TABLE "Post";
