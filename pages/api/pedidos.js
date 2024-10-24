import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  
  if (method === 'GET') {
    return getPedidos(req, res);
  } else if (method === 'POST') {
    return crearPedido(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${method} no permitido`);
  }
}

// Función para manejar la obtención de pedidos (GET)
async function getPedidos(req, res) {
  const { correo } = req.query;

  if (!correo) {
    return res.status(400).json({ error: 'Correo del cliente no proporcionado' });
  }

  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        correo,
      },
      include: {
        contiene: true,  // Incluye los productos relacionados al pedido
      },
      orderBy: {
        fecha: 'desc',  // Ordenar por fecha en orden descendente (más recientes primero)
      },
    });

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'No se encontraron pedidos para este correo' });
    }

    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
}

// Función para manejar la creación de pedidos (POST)
async function crearPedido(req, res) {
  const { productos, precioTotal, correo, estado = 'solicitado' } = req.body;

  // Validación de datos
  if (!productos || !precioTotal || !correo) {
    return res.status(400).json({ error: 'Faltan datos requeridos para crear el pedido' });
  }

  // Verificar que el estado es válido
  const estadosValidos = ['solicitado', 'aceptado', 'en_camino', 'completado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const nuevoPedido = await prisma.pedido.create({
      data: {
        fecha: new Date(),
        precio_total: parseFloat(precioTotal),  // Convertir el precio total a decimal
        correo,  // Correo del cliente autenticado
        estado,  // Estado del pedido (solicitado, aceptado, en_camino, completado)
        contiene: {
          create: productos.map((producto) => ({
            nombre_producto: producto.nombre_producto,
            unidades: producto.cantidad,
            nombre: producto.nombre_restaurante,
            localidad: producto.localidad,
          })),
        },
      },
      include: { contiene: true },  // Incluye los productos asociados al pedido
    });

    res.status(200).json({ message: 'Pedido creado exitosamente', pedido: nuevoPedido });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
}
