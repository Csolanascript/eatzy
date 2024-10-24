import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  
  if (method === 'GET') {
    return listarPedidosPorRestaurante(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${method} no permitido`);
  }
}

// Función para listar los pedidos de un restaurante específico
async function listarPedidosPorRestaurante(req, res) {
  const { nombre, localidad } = req.query;

  // Validar que nombre y localidad estén presentes
  if (!nombre || !localidad) {
    return res.status(400).json({ error: 'Nombre del restaurante y localidad son requeridos' });
  }

  try {
    // Buscar todos los pedidos asociados al restaurante (sin importar el correo del cliente)
    const pedidos = await prisma.pedido.findMany({
      where: {
        contiene: {
          some: {
            nombre: nombre,  // Filtrar por nombre del restaurante
            localidad: localidad,  // Filtrar por localidad del restaurante
          },
        },
      },
      include: {
        contiene: true,  // Incluir los productos relacionados al pedido
      },
      orderBy: {
        fecha: 'desc',  // Ordenar por fecha descendente
      },
    });

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'No se encontraron pedidos para este restaurante' });
    }

    // Devolver los pedidos encontrados
    res.status(200).json(pedidos);
  } catch (error) {
    console.error('Error al obtener los pedidos del restaurante:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos del restaurante' });
  }
}
