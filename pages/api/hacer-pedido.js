import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productos, precioTotal, correo } = req.body;

    // Verificar que los datos requeridos estén presentes
    if (!productos || !precioTotal || !correo) {
      return res.status(400).json({ message: 'Faltan datos requeridos en la solicitud' });
    }

    try {
      // Crear un nuevo pedido junto con los productos relacionados en la tabla `contiene`
      const nuevoPedido = await prisma.pedido.create({
        data: {
          fecha: new Date(),
          precio_total: parseFloat(precioTotal), // Asegúrate de que sea un número decimal válido
          correo, // Correo del cliente autenticado
          contiene: {
            create: productos.map((producto) => ({
              nombre_producto: producto.nombre_producto,
              unidades: producto.cantidad,
              nombre: producto.nombre_restaurante,
              localidad: producto.localidad,
            })),
          },
        },
        include: { contiene: true }, // Incluir la relación con `contiene` para obtener los productos asociados
      });

      // Respuesta exitosa
      res.status(200).json({ message: 'Pedido creado exitosamente', pedido: nuevoPedido });
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
    }
  } else if (req.method === 'GET') {
    const { correo } = req.query;

    if (!correo) {
      return res.status(400).json({ error: 'Correo del cliente no proporcionado' });
    }

    try {
      // Obtener los pedidos del cliente autenticado, incluyendo los productos relacionados
      const pedidos = await prisma.pedido.findMany({
        where: {
          correo,
        },
        include: {
          contiene: true, // Incluir los productos asociados al pedido
        },
      });

      // Respuesta con los pedidos del cliente
      res.status(200).json(pedidos);
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      res.status(500).json({ error: 'Error al obtener los pedidos', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
