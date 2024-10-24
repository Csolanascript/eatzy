import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productos, precioTotal, correo } = req.body;

    try {
      // Crear un nuevo pedido con la relación contiene
      const nuevoPedido = await prisma.pedido.create({
        data: {
          fecha: new Date(),
          precio_total: parseFloat(precioTotal),  // Asegúrate de que sea un número decimal
          correo,  // Correo del cliente autenticado
          contiene: {
            create: productos.map(producto => ({
              nombre_producto: producto.nombre_producto,
              unidades: producto.cantidad,
              nombre: producto.nombre_restaurante,
              localidad: producto.localidad,
            })),
          },
        },
      });

      res.status(200).json({ message: 'Pedido creado exitosamente', pedido: nuevoPedido });
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      res.status(500).json({ message: 'Error al crear el pedido' });
    }
  } else if (req.method === 'GET') {
    const { correo } = req.query;

    if (!correo) {
      return res.status(400).json({ error: 'Correo del cliente no proporcionado' });
    }

    try {
      // Obtener solo los pedidos del cliente autenticado
      const pedidos = await prisma.pedido.findMany({
        where: {
          correo,
        },
        include: {
          contiene: true, // Incluir los productos asociados al pedido
        },
      });
      res.status(200).json(pedidos);
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
