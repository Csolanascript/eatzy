-- CreateEnum
CREATE TYPE "tipo_usuario" AS ENUM ('Cliente', 'Propietario');

-- CreateTable
CREATE TABLE "contiene" (
    "id" SERIAL NOT NULL,
    "nombre_producto" VARCHAR(100) NOT NULL,
    "unidades" INTEGER,
    "nombre" VARCHAR(100) NOT NULL,
    "localidad" VARCHAR(100) NOT NULL,
    "pedidoId" INTEGER NOT NULL,

    CONSTRAINT "contiene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id" SERIAL NOT NULL,
    "fecha" DATE,
    "precio_total" DECIMAL(10,2),
    "correo" VARCHAR(100),

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "nombre_producto" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2),
    "nombre" VARCHAR(100) NOT NULL,
    "localidad" VARCHAR(100) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("nombre","localidad","nombre_producto")
);

-- CreateTable
CREATE TABLE "restaurante" (
    "nombre" VARCHAR(100) NOT NULL,
    "numtelefono" VARCHAR(15),
    "categoria" VARCHAR(50),
    "correo" VARCHAR(100),
    "localidad" VARCHAR(100) NOT NULL,

    CONSTRAINT "restaurante_pkey" PRIMARY KEY ("nombre","localidad")
);

-- CreateTable
CREATE TABLE "usuario" (
    "correo" VARCHAR(100) NOT NULL,
    "nombre_usuario" VARCHAR(100) NOT NULL,
    "contrasena" VARCHAR(100) NOT NULL,
    "localidad" VARCHAR(100),
    "calle" VARCHAR(100),
    "piso" VARCHAR(10),
    "numero" INTEGER,
    "codigo_postal" VARCHAR(10),
    "tipo" "tipo_usuario" NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("correo")
);

-- CreateIndex
CREATE UNIQUE INDEX "contiene_nombre_producto_nombre_localidad_pedidoId_key" ON "contiene"("nombre_producto", "nombre", "localidad", "pedidoId");

-- AddForeignKey
ALTER TABLE "contiene" ADD CONSTRAINT "contiene_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedido"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contiene" ADD CONSTRAINT "contiene_nombre_producto_nombre_localidad_fkey" FOREIGN KEY ("nombre_producto", "nombre", "localidad") REFERENCES "productos"("nombre_producto", "nombre", "localidad") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_correo_fkey" FOREIGN KEY ("correo") REFERENCES "usuario"("correo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_nombre_localidad_fkey" FOREIGN KEY ("nombre", "localidad") REFERENCES "restaurante"("nombre", "localidad") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "restaurante" ADD CONSTRAINT "restaurante_correo_fkey" FOREIGN KEY ("correo") REFERENCES "usuario"("correo") ON DELETE NO ACTION ON UPDATE NO ACTION;
