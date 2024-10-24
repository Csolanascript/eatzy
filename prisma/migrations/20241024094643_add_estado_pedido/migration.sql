-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('solicitado', 'aceptado', 'en_camino', 'completado');

-- AlterTable
ALTER TABLE "pedido" ADD COLUMN     "estado" "EstadoPedido" NOT NULL DEFAULT 'solicitado';
