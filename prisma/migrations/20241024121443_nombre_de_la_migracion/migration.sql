/*
  Warnings:

  - The values [solicitado,aceptado] on the enum `EstadoPedido` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EstadoPedido_new" AS ENUM ('en_cocina', 'en_camino', 'completado');
ALTER TABLE "pedido" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "pedido" ALTER COLUMN "estado" TYPE "EstadoPedido_new" USING ("estado"::text::"EstadoPedido_new");
ALTER TYPE "EstadoPedido" RENAME TO "EstadoPedido_old";
ALTER TYPE "EstadoPedido_new" RENAME TO "EstadoPedido";
DROP TYPE "EstadoPedido_old";
ALTER TABLE "pedido" ALTER COLUMN "estado" SET DEFAULT 'en_cocina';
COMMIT;

-- AlterTable
ALTER TABLE "pedido" ALTER COLUMN "estado" SET DEFAULT 'en_cocina';
