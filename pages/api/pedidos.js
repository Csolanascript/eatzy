import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  
  if (method === 'GET') {
    return getPedidos(req, res);
  } else if (method === 'POST') {
    return crearPedido(req, res);
  } else if (method === 'PUT') {
    return actualizarEstadoPedido(req, res); // Añadimos manejo para actualizar el estado
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Método ${method} no permitido`);
  }
}

async function getPedidos(req, res) {
  const { correo } = req.query;  // Solo obtener el correo del cliente

  if (!correo) {
    return res.status(400).json({ error: 'Correo del cliente no proporcionado' });
  }

  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        correo,  // Filtrar por el correo del cliente
      },
      include: {
        contiene: true,  // Incluir los productos relacionados al pedido
      },
      orderBy: {
        fecha: 'desc',  // Ordenar por fecha en orden descendente (más recientes primero)
      },
    });

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'No se encontraron pedidos para este cliente' });
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
  const estadosValidos = ['en_cocina', 'en_camino', 'completado'];
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

// Función para manejar la actualización del estado del pedido (PUT)
async function actualizarEstadoPedido(req, res) {
  const { id, estado, nombre, localidad } = req.body;

  if (!id || !estado || !nombre || !localidad) {
    return res.status(400).json({ error: 'Faltan datos requeridos para actualizar el estado del pedido' });
  }

  // Definimos los estados válidos
  const estadosValidos = ['en_cocina', 'en_camino', 'completado'];

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    // Verificar que el pedido pertenece al restaurante específico
    const pedido = await prisma.pedido.findFirst({
      where: {
        id: parseInt(id),
        contiene: {
          some: {
            nombre: nombre,  // Filtrar por el nombre del restaurante
            localidad: localidad,  // Filtrar por la localidad del restaurante
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado para este restaurante' });
    }

    // Solo se permite avanzar al siguiente estado (de 'en_cocina' a 'en_camino' y de 'en_camino' a 'completado')
    if (
      (pedido.estado === 'en_cocina' && estado === 'en_camino') ||
      (pedido.estado === 'en_camino' && estado === 'completado')
    ) {
      const pedidoActualizado = await prisma.pedido.update({
        where: { id: parseInt(id) },
        data: { estado },
      });

      return res.status(200).json({ message: 'Estado actualizado correctamente', pedido: pedidoActualizado });
    } else {
      return res.status(400).json({ error: 'Cambio de estado no permitido' });
    }
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del pedido' });
  }
}
